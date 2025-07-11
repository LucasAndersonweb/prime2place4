import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const API_KEY = "ebf5cd003e6bf2820075a809cfd9d4ad";
    const BASE_URL = "https://prime2pl-rest.vistahost.com.br";
    const urlParams = new URL(request.url).searchParams;

    const category = urlParams.get("category");
    const PAGE_SIZE = 50;

    const filter =
      category === "Venda"
        ? { ValorVenda: [">", 0] }
        : { ValorLocacao: [">", 0] };

    const pesquisaObj = {
      fields: [
        "Codigo",
        "Categoria",
        "Bairro",
        "Cidade",
        "ValorVenda",
        "ValorLocacao",
        "Dormitorios",
        "Suites",
        "Vagas",
        "AreaPrivativa",
        "AreaTotal",
      ],
      filter,
      paginacao: {
        pagina: 1,
        quantidade: PAGE_SIZE,
      },
    };

    const pesquisaJSON = encodeURIComponent(JSON.stringify(pesquisaObj));
    const url = `${BASE_URL}/imoveis/listar?key=${API_KEY}&pesquisa=${pesquisaJSON}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar imóveis: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro ao buscar imóveis:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
