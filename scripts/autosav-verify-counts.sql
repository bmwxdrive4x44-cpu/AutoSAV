select 'Category' as table_name, count(*)::bigint as total from public."Category"
union all
select 'Dispute', count(*)::bigint from public."Dispute"
union all
select 'NotificationLog', count(*)::bigint from public."NotificationLog"
union all
select 'Offer', count(*)::bigint from public."Offer"
union all
select 'ProductRequest', count(*)::bigint from public."ProductRequest"
union all
select 'Shipment', count(*)::bigint from public."Shipment"
union all
select 'Transaction', count(*)::bigint from public."Transaction"
union all
select 'TransactionMessage', count(*)::bigint from public."TransactionMessage"
union all
select 'User', count(*)::bigint from public."User"
order by table_name;
