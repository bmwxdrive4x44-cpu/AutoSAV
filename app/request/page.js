import RequestForm from "./request-form.js";

export default async function RequestPage({ searchParams }) {
  const params = await searchParams;
  const requestedPart = params?.part || "";

  return <RequestForm requestedPart={requestedPart} />;
}
