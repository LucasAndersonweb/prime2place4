import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 'params' é uma Promise
) {
  try {
    const { id } = await params; // Aguardando a resolução de 'params'

    console.log("id:", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID do imóvel não fornecido." },
        { status: 400 }
      );
    }

    const API_KEY = "ebf5cd003e6bf2820075a809cfd9d4ad"; // Chave de produção
    const BASE_URL = "https://prime2pl-rest.vistahost.com.br";

    const pesquisa = JSON.stringify({
      fields: [
        "TituloSite",
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
        "ValorIptu",
        "AreaTotal",
        {
          Foto: ["Foto", "FotoPequena", "Destaque"],
        },
        {
          Video: ["Video", "Destaque"],
        },
        "Caracteristicas",
        "InfraEstrutura",
        "ValorCondominio",
        "Exclusivo",
        "Lancamento",
      ],
    });

    const url = `${BASE_URL}/imoveis/detalhes?key=${API_KEY}&imovel=${id}&pesquisa=${encodeURIComponent(
      pesquisa
    )}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar detalhes do imóvel ${id}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Dados completos da API Vista:", JSON.stringify(data, null, 2));
    console.log("Estrutura dos dados:", Object.keys(data));
    console.log("IPTU:", data.ValorIptu);
    console.log("Condomínio:", data.ValorCondominio);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar dados do imóvel";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
