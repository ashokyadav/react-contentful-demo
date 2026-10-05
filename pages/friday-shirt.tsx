export async function getServerSideProps() {
  return { redirect: { destination: "/clothing/apparel", permanent: false } };
}

export default function FridayShirtRedirect() {
  return null;
}
