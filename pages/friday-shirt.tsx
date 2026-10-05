export async function getServerSideProps() {
  return { redirect: { destination: "/clothing/dress-shirts", permanent: false } };
}

export default function FridayShirtRedirect() {
  return null;
}
