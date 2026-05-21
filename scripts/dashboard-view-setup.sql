-- =============================================================
-- AutoSAV — Dashboard SQL VIEW + indexes + scoring
-- Exécuter une fois dans le SQL Editor Supabase (projet Swiftcolis)
-- =============================================================

-- 1. INDEX DE PERFORMANCE
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_productrequest_requester
  ON public."ProductRequest" ("clientId");

CREATE INDEX IF NOT EXISTS idx_productrequest_status
  ON public."ProductRequest" ("status");

CREATE INDEX IF NOT EXISTS idx_productrequest_requester_status
  ON public."ProductRequest" ("clientId", "status");

CREATE INDEX IF NOT EXISTS idx_offer_provider
  ON public."Offer" ("agentBuyerId");

CREATE INDEX IF NOT EXISTS idx_offer_request
  ON public."Offer" ("requestId");

CREATE INDEX IF NOT EXISTS idx_offer_status
  ON public."Offer" ("status");

CREATE INDEX IF NOT EXISTS idx_offer_provider_status
  ON public."Offer" ("agentBuyerId", "status");

CREATE INDEX IF NOT EXISTS idx_shipment_provider
  ON public."Shipment" ("agentBuyerId");

CREATE INDEX IF NOT EXISTS idx_shipment_request
  ON public."Shipment" ("requestId");

CREATE INDEX IF NOT EXISTS idx_transaction_requester
  ON public."Transaction" ("clientId");

CREATE INDEX IF NOT EXISTS idx_dispute_reported_by
  ON public."Dispute" ("reportedById");

CREATE INDEX IF NOT EXISTS idx_dispute_status
  ON public."Dispute" ("status");


-- 2. VIEW DASHBOARD SUMMARY
-- Vue paramètrée par userId via current_setting
-- Usage : SELECT set_config('app.current_user_id','<userId>',true); SELECT * FROM dashboard_summary;
-- =============================================================
DROP VIEW IF EXISTS dashboard_summary;

CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  u.id AS user_id,

  -- Demandes créées (rôle client)
  (SELECT count(*) FROM public."ProductRequest" r WHERE r."clientId" = u.id AND r."deletedAt" IS NULL)
    AS my_requests_count,

  -- Offres reçues sur ses demandes (rôle client)
  (SELECT count(*) FROM public."Offer" o
   JOIN public."ProductRequest" r ON o."requestId" = r.id
   WHERE r."clientId" = u.id AND o."deletedAt" IS NULL)
    AS offers_received_count,

  -- Offres soumises (rôle provider)
  (SELECT count(*) FROM public."Offer" o WHERE o."agentBuyerId" = u.id AND o."deletedAt" IS NULL)
    AS submitted_offers_count,

  -- Livraisons actives (shipment sans deliveredAt)
  (SELECT count(*) FROM public."Shipment" s WHERE s."agentBuyerId" = u.id AND s."deliveredAt" IS NULL)
    AS active_deliveries_count,

  -- Litiges impliquant l'utilisateur
  (SELECT count(*) FROM public."Dispute" d
   WHERE d."reportedById" = u.id OR
         d."requestId" IN (SELECT id FROM public."ProductRequest" WHERE "clientId" = u.id)
  ) AS disputes_count,

  -- Transactions (client ou provider)
  (SELECT count(*) FROM public."Transaction" t
   WHERE t."clientId" = u.id OR
         t."requestId" IN (SELECT r.id FROM public."ProductRequest" r
                           JOIN public."Offer" o ON r."acceptedOfferId" = o.id
                           WHERE o."agentBuyerId" = u.id)
  ) AS transactions_count,

  -- === TRUST SCORE ===
  -- Livraisons réussies (+5 pts chacune)
  LEAST(100,
    GREATEST(0,
      (SELECT count(*) FROM public."Shipment" s WHERE s."agentBuyerId" = u.id AND s."deliveredAt" IS NOT NULL) * 5
      + (SELECT count(*) FROM public."Transaction" t WHERE t."clientId" = u.id AND t."status" = 'RELEASED') * 3
      -- Litiges ouverts pénalisent (-10 pts chacun)
      - (SELECT count(*) FROM public."Dispute" d WHERE d."reportedById" = u.id AND d."status" = 'OPEN') * 10
      -- Activité récente (30j) bonus
      + CASE WHEN (SELECT max("createdAt") FROM public."ProductRequest" WHERE "clientId" = u.id) > now() - interval '30 days' THEN 5 ELSE 0 END
      + 50 -- base score
    )
  ) AS trust_score

FROM public."User" u;


-- 3. FONCTION SCORING EXPLICITE (RPC via Supabase)
-- Appel : SELECT * FROM get_user_trust_score('<userId>')
-- =============================================================
CREATE OR REPLACE FUNCTION get_user_trust_score(p_user_id text)
RETURNS TABLE(
  user_id       text,
  trust_score   int,
  risk_level    text,
  flagged       boolean,
  details       jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deliveries_ok   int;
  v_transactions_ok int;
  v_disputes_open   int;
  v_disputes_total  int;
  v_cancellations   int;
  v_recent_activity boolean;
  v_score           int;
  v_risk            text;
  v_flagged         boolean;
BEGIN
  SELECT count(*) INTO v_deliveries_ok
  FROM public."Shipment" WHERE "agentBuyerId" = p_user_id AND "deliveredAt" IS NOT NULL;

  SELECT count(*) INTO v_transactions_ok
  FROM public."Transaction" WHERE "clientId" = p_user_id AND "status" = 'RELEASED';

  SELECT count(*) INTO v_disputes_open
  FROM public."Dispute" WHERE "reportedById" = p_user_id AND "status" = 'OPEN';

  SELECT count(*) INTO v_disputes_total
  FROM public."Dispute" WHERE "reportedById" = p_user_id;

  SELECT count(*) INTO v_cancellations
  FROM public."Offer" WHERE "agentBuyerId" = p_user_id AND "status" = 'CANCELLED';

  SELECT EXISTS(
    SELECT 1 FROM public."ProductRequest"
    WHERE "clientId" = p_user_id AND "createdAt" > now() - interval '30 days'
  ) INTO v_recent_activity;

  -- Calcul du score
  v_score := 50
    + (v_deliveries_ok * 5)
    + (v_transactions_ok * 3)
    - (v_disputes_open * 10)
    - (v_cancellations * 3)
    + CASE WHEN v_recent_activity THEN 5 ELSE 0 END;

  v_score := LEAST(100, GREATEST(0, v_score));

  -- Niveau de risque
  IF v_score >= 70 THEN
    v_risk := 'LOW';
  ELSIF v_score >= 40 THEN
    v_risk := 'MEDIUM';
  ELSE
    v_risk := 'HIGH';
  END IF;

  -- Anti-fraude : flagged si ratio litiges > 30% ou plus de 5 litiges ouverts en 7 jours
  v_flagged := (
    (v_disputes_total > 0 AND v_disputes_open::float / GREATEST(1, v_disputes_total) > 0.3)
    OR (SELECT count(*) FROM public."Dispute"
        WHERE "reportedById" = p_user_id AND "status" = 'OPEN' AND "createdAt" > now() - interval '7 days') >= 3
    OR v_cancellations > 10
  );

  RETURN QUERY SELECT
    p_user_id,
    v_score,
    v_risk,
    v_flagged,
    jsonb_build_object(
      'deliveriesOk',      v_deliveries_ok,
      'transactionsOk',    v_transactions_ok,
      'disputesOpen',      v_disputes_open,
      'disputesTotal',     v_disputes_total,
      'cancellations',     v_cancellations,
      'recentActivity',    v_recent_activity
    );
END;
$$;

-- 4. FONCTION DASHBOARD COUNTS (RPC sans paramètre via JWT Supabase)
-- Pour utilisation future avec Supabase JS client
-- =============================================================
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id text)
RETURNS TABLE(
  my_requests_count       bigint,
  offers_received_count   bigint,
  submitted_offers_count  bigint,
  active_deliveries_count bigint,
  disputes_count          bigint,
  transactions_count      bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    (SELECT count(*) FROM public."ProductRequest" WHERE "clientId" = p_user_id AND "deletedAt" IS NULL),
    (SELECT count(*) FROM public."Offer" o JOIN public."ProductRequest" r ON o."requestId" = r.id WHERE r."clientId" = p_user_id AND o."deletedAt" IS NULL),
    (SELECT count(*) FROM public."Offer" WHERE "agentBuyerId" = p_user_id AND "deletedAt" IS NULL),
    (SELECT count(*) FROM public."Shipment" WHERE "agentBuyerId" = p_user_id AND "deliveredAt" IS NULL),
    (SELECT count(*) FROM public."Dispute" WHERE "reportedById" = p_user_id OR "requestId" IN (SELECT id FROM public."ProductRequest" WHERE "clientId" = p_user_id)),
    (SELECT count(*) FROM public."Transaction" WHERE "clientId" = p_user_id);
$$;
