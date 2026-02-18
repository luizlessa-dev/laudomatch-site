export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return { props: {} };
}

export default function DataDeletion() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Solicitação de Exclusão de Dados – LaudoMatch</h1>
      <p>Para solicitar a exclusão dos seus dados, envie um email para:</p>
      <strong>suporte@laudomatch.com</strong>
      <p>Inclua seu nome e email cadastrado.</p>
      <p>Prazo de resposta: até 7 dias úteis.</p>
    </div>
  );
}
