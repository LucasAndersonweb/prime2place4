import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const API_KEY = "ebf5cd003e6bf2820075a809cfd9d4ad";
    const BASE_URL = "https://prime2pl-rest.vistahost.com.br";
    console.log("entrou no GET");
    const PAGE_SIZE = 50;
    let currentPage = 1;
    let allResults: any[] = [];

    while (true) {
      const pesquisaObj = {
        fields: [
          "Codigo",
          "Categoria",
          "DescricaoWeb",
          "Bairro",
          "Cidade",
          "ValorVenda",
          "ValorLocacao",
          "Dormitorios",
          "Suites",
          "Vagas",
          "AreaPrivativa",
          "AreaTotal",
          "ValorCondominio",
          "ValorIptu",
          "Exclusivo",
          "Lancamento",
          "EmDestaque",
        ],
        paginacao: {
          pagina: currentPage,
          quantidade: PAGE_SIZE,
        },
      };

      const pesquisaJSON = encodeURIComponent(JSON.stringify(pesquisaObj));
      const url = `${BASE_URL}/imoveis/listar?key=${API_KEY}&pesquisa=${pesquisaJSON}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        console.error(`Erro: ${response.status} - ${response.statusText}`);
        throw new Error(`Erro ao listar imóveis: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.message === "A pesquisa não retornou resultados.") {
        break;
      }

      const resultados = Object.values(data || {});

      allResults = [...allResults, ...resultados];

      if (resultados.length < PAGE_SIZE) {
        break;
      }

      currentPage++;
    }

    return NextResponse.json(allResults);
  } catch (error: any) {
    console.error("Erro ao buscar imóveis:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
