// src/app/api/property/all/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const API_KEY = "SUA_API_KEY"; // Substitua pela sua chave da Vista
    const BASE_URL = "https://prime2pl-rest.vistahost.com.br";

    let paginaAtual = 1;
    const tamanhoPagina = 50;
    const allProperties: unknown[] = [];

    while (true) {
      // Objeto de pesquisa
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
          "AreaTotal",
          "AreaPrivativa",
        ],
        paginacao: {
          pagina: paginaAtual,
          quantidade: tamanhoPagina,
        },
      };

      // Gera o JSON para enviar na requisição
      const pesquisaJSON = JSON.stringify(pesquisaObj);

      // Monta a URL da API
      const url = `${BASE_URL}/imoveis/listar?key=${API_KEY}&pesquisa=${encodeURIComponent(
        pesquisaJSON
      )}`;

      console.log(`Buscando imóveis na página ${paginaAtual}:`, url);

      // Faz a requisição para a API da Vista
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-cache", // Garante que estamos buscando os dados mais atualizados
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Erro retornado pela API:", errorBody);
        throw new Error(
          `Erro ao listar imóveis (página ${paginaAtual}): ${response.statusText}`
        );
      }

      const data = await response.json();
      const properties = Object.values(data); // Converte os resultados para um array

      console.log(`Página ${paginaAtual} retornou ${properties.length} itens.`);

      // Se a página não retornar itens, paramos o loop
      if (properties.length === 0) {
        break;
      }

      // Adiciona os imóveis ao array total
      allProperties.push(...properties);

      // Verifica se chegou ao final (última página)
      if (properties.length < tamanhoPagina) {
        break;
      }

      // Avança para a próxima página
      paginaAtual++;
    }

    console.log(`Total de imóveis coletados: ${allProperties.length}`);

    // Retorna todos os imóveis como JSON
    return NextResponse.json(allProperties);
  } catch (err: any) {
    console.error("Erro ao buscar imóveis:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
