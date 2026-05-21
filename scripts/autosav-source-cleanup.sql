begin;

-- Executer ce script UNIQUEMENT apres verification complete sur la nouvelle base.
-- Ce script supprime les tables AutoSAV de l'ancien projet swiftcolis.

drop table if exists public."Dispute" cascade;
drop table if exists public."TransactionMessage" cascade;
drop table if exists public."Transaction" cascade;
drop table if exists public."Shipment" cascade;
drop table if exists public."Offer" cascade;
drop table if exists public."ProductRequest" cascade;
drop table if exists public."NotificationLog" cascade;
drop table if exists public."Category" cascade;
drop table if exists public."User" cascade;
drop table if exists public."_prisma_migrations" cascade;

commit;
