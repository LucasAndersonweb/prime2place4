import { NextResponse } from "next/server";

// Handler para o método GET
export async function GET(request: Request) {
  const API_KEY = "c9fdd79584fb8d369a6a579af1a8f681";
  const BASE_URL = "http://sandbox-rest.vistahost.com.br/imoveis/listar";
  const url = `${BASE_URL}?key=${API_KEY}&pesquisa={"fields":["Codigo","Cidade","Bairro","ValorVenda"]}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter os dados: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data); // Retorna a resposta JSON
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // Retorna erro
  }
}
