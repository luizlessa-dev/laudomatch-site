export async function GET() {
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Data Deletion - LaudoMatch</title>
      </head>
      <body style="font-family: Arial; padding: 40px;">
        <h1>Solicitação de Exclusão de Dados – LaudoMatch</h1>
        <p>Para solicitar a exclusão dos seus dados, envie um email para:</p>
        <strong>suporte@laudomatch.com</strong>
        <p>Inclua seu nome e email cadastrado.</p>
        <p>Prazo de resposta: até 7 dias úteis.</p>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store"
      }
    }
  );
}
