"use client";

import { useState, useEffect, useCallback, memo } from "react";
import styles from "./styles.module.scss";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import {
  FaBuilding,
  FaBed,
  FaCar,
  FaShower,
  FaVectorSquare,
  FaMoneyBillWave,
  FaListUl,
  FaRegFrownOpen,
  FaSpinner,
} from "react-icons/fa";
import { MdOutlineFilterList } from "react-icons/md";
import { useRouter } from "next/navigation";

// Função para normalizar strings para comparação
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s]/gi, "") // Remove caracteres especiais
    .replace(/\s+/g, ""); // Remove espaços
}

// Lista de características do imóvel
const caracteristicasImovel = [
  "AguaQuente",
  "ArCentral",
  "AreaServico",
  "BanheiroAuxiliar",
  "BanheiroSocial",
  "BanheiroSocialQtd",
  "Churrasqueira",
  "Closet",
  "CopaCozinha",
  "Cozinha",
  "CozinhaMontada",
  "Deck",
  "DependenciadeEmpregada",
  "Despensa",
  "EspacoPet",
  "EstarIntimo",
  "FitnessExterno",
  "Gabinete",
  "Gradeado",
  "Hidromassagem",
  "HomeTheater",
  "JardimInverno",
  "Lareira",
  "Lavabo",
  "Living",
  "LivingHall",
  "Mobiliado",
  "Piscina",
  "PiscinaAquecida",
  "Quadra",
  "QuadraPoliEsportiva",
  "Quintal",
  "Reformado",
  "Sacada",
  "SacadaComChurrasqueira",
  "SalaArmarios",
  "SalaJantar",
  "Salas",
  "SemiMobiliado",
  "Split",
  "SuiteMaster",
  "Terraco",
  "VistaPanoramica",
  "WCEmpregada",
];

// Lista de características de infraestrutura
const caracteristicasInfraestrutura = [
  "Brinquedoteca",
  "ChurrasqueiraCondominio",
  "Cinema",
  "CircuitoFechadoTV",
  "CondominioFechado",
  "DeckMolhado",
  "Deposito",
  "Ducha",
  "Edicula",
  "Elevador",
  "ElevadorServico",
  "EspacoGourmet",
  "Fitness",
  "FornoDePizza",
  "GasCentral",
  "Gradil",
  "Interfone",
  "Jardim",
  "LanHouse",
  "Lavanderia",
  "Massagem",
  "Pilotis",
  "PiscinaInfantil",
  "PiscinaNoCondominio",
  "PisoSala",
  "Playground",
  "Portaria",
  "Portaria24Hrs",
  "PorteiroEletronico",
  "PracaCentral",
  "Prainha",
  "QuadraEsportes",
  "QuadraTenis",
  "Quiosque",
  "Redario",
  "Sala",
  "SalaConvecoes",
  "SalaDeEstudos",
  "SalaEstar",
  "SalaoBrinquedo",
  "SalaoDeFestasGourmet",
  "SalaoDeJogosAdulto",
  "SalaoDeJogosTeen",
  "SalaoFestas",
  "SalaoJogos",
  "SalaRecepcao",
  "SalasEdificio",
  "Sauna",
  "SegurancaPatrimonial",
  "Solarium",
  "Spa",
  "Zelador",
];

interface BuildingSummary {
  Codigo: string;
  Categoria: string;
  Bairro: string;
  Cidade: string;
  ValorVenda: number | string;
  ValorLocacao?: number | string;
  Dormitorios: number | string;
  Suites: number | string;
  Vagas: number | string;
  AreaTotal?: number | string;
  AreaPrivativa?: number | string;
  TipoImovel: string;
  Caracteristicas?: Record<string, string>;
}

interface BuildingDetails extends BuildingSummary {
  Caracteristicas?: Record<string, string>;
  InfraEstrutura?: Record<string, string>;
  Foto?:
    | { Foto: string; FotoPequena: string; Destaque: string }[]
    | Record<string, any>;
  Exclusivo?: string;
  Lancamento?: string;
}

function matchNumberFilter(
  buildValue: number | string | undefined,
  selectedValue: string
): boolean {
  if (!selectedValue) return true;
  const numericValue = Number(buildValue ?? 0);
  if (selectedValue === "4+") {
    return numericValue >= 4;
  }
  return numericValue === Number(selectedValue);
}

function getAppliedFilters(filters: {
  tiposImovel: string[];
  areaMin: string;
  areaMax: string;
  valorMin: string;
  valorMax: string;
  caracteristicas: string[];
  dormitories: string;
  suites: string;
  vagas: string;
  Codigo: string;
}) {
  const applied: string[] = [];

  if (filters.Codigo) {
    applied.push(`Código: ${filters.Codigo}`);
  }

  if (filters.tiposImovel.length > 0) {
    applied.push(`Tipo(s): ${filters.tiposImovel.join(", ")}`);
  }

  if (filters.caracteristicas.length > 0) {
    applied.push(`Características: ${filters.caracteristicas.join(", ")}`);
  }

  if (filters.dormitories) {
    applied.push(`Dormitórios: ${filters.dormitories}`);
  }

  if (filters.suites) {
    applied.push(`Suítes: ${filters.suites}`);
  }

  if (filters.vagas) {
    applied.push(`Vagas: ${filters.vagas}`);
  }

  if (filters.areaMin) {
    applied.push(`Área Min: ${filters.areaMin}m²`);
  }

  if (filters.areaMax) {
    applied.push(`Área Máx: ${filters.areaMax}m²`);
  }

  if (filters.valorMin) {
    applied.push(`Valor Min: R$${filters.valorMin}`);
  }

  if (filters.valorMax) {
    applied.push(`Valor Máx: R$${filters.valorMax}`);
  }

  return applied;
}

export default function SearchPage() {
  const router = useRouter();
  const PAGE_SIZE = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allBuildings, setAllBuildings] = useState<BuildingDetails[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<BuildingDetails[]>(
    []
  );
  const [searchParams, setSearchParams] = useState<URLSearchParams>();

  const [filters, setFilters] = useState({
    tiposImovel: [] as string[],
    areaMin: "",
    areaMax: "",
    valorMin: "",
    valorMax: "",
    caracteristicas: [] as string[],
    dormitories: "",
    suites: "",
    vagas: "",
    bairro: "",
    cidade: "",
    Codigo: "",
  });

  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [urlFiltersApplied, setUrlFiltersApplied] = useState(false);

  const [availableFilters, setAvailableFilters] = useState({
    tipoImovelOptions: [] as string[],
    caracteristicasOptions: [] as string[],
  });

  const [showFilters, setShowFilters] = useState(false);

  const [expanded, setExpanded] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [dataLoaded, setDataLoaded] = useState(false);

  // Função para aplicar os filtros - declarada antes do useEffect
  const handleApplyFilters = useCallback(() => {
    console.log("Aplicando filtros...");

    const filtered = allBuildings.filter((building) => {
      // Verifica se deve filtrar por código
      const isCodigoMatch = filters.Codigo
        ? building.Codigo?.toLowerCase().includes(filters.Codigo.toLowerCase())
        : true;

      // Verifica se deve filtrar apenas os exclusivos
      const exclusivoParam = searchParams?.get("exclusivo");
      const isExclusivoMatch =
        exclusivoParam && exclusivoParam.toLowerCase() === "sim"
          ? building.Exclusivo === "Sim"
          : true;

      const isTipoImovelMatch =
        filters.tiposImovel.length > 0
          ? filters.tiposImovel.some(
              (tipo) => tipo.toLowerCase() === building.Categoria.toLowerCase()
            )
          : true;

      const areaPrivativaNum = Number(building.AreaPrivativa ?? 0);
      const isAreaMinMatch = filters.areaMin
        ? areaPrivativaNum >= Number(filters.areaMin)
        : true;
      const isAreaMaxMatch = filters.areaMax
        ? areaPrivativaNum <= Number(filters.areaMax)
        : true;

      const valorVendaNum = Number(building.ValorVenda ?? 0);
      const isValorMinMatch = filters.valorMin
        ? valorVendaNum >= Number(filters.valorMin)
        : true;
      const isValorMaxMatch = filters.valorMax
        ? valorVendaNum <= Number(filters.valorMax)
        : true;

      // Verificar características tanto na lista de Caracteristicas quanto na lista de InfraEstrutura
      const isCaracteristicasMatch =
        filters.caracteristicas.length > 0
          ? filters.caracteristicas.every(
              (char) =>
                building.Caracteristicas?.[char] === "Sim" ||
                building.InfraEstrutura?.[char] === "Sim"
            )
          : true;

      const meetsDormFilter = matchNumberFilter(
        building.Dormitorios,
        filters.dormitories
      );
      const meetsSuiteFilter = matchNumberFilter(
        building.Suites,
        filters.suites
      );
      const meetsVagaFilter = matchNumberFilter(building.Vagas, filters.vagas);

      // Filtro por bairro - verifica se há múltiplos bairros separados por vírgula
      let isBairroMatch = true;
      if (filters.bairro) {
        if (filters.bairro.includes(",")) {
          // Se há múltiplos bairros, verifica se o imóvel está em algum deles
          const bairrosList = filters.bairro
            .split(",")
            .map((b) => b.trim().toLowerCase());
          isBairroMatch = bairrosList.some((b) =>
            building.Bairro?.toLowerCase().includes(b)
          );
        } else {
          // Se há apenas um bairro
          isBairroMatch = building.Bairro?.toLowerCase().includes(
            filters.bairro.toLowerCase()
          );
        }
      }

      // Filtro por cidade
      let isCidadeMatch = true;
      if (filters.cidade) {
        if (filters.cidade.includes(",")) {
          // Se há múltiplas cidades, verifica se o imóvel está em alguma delas
          const cidadesList = filters.cidade
            .split(",")
            .map((c) => c.trim().toLowerCase());
          isCidadeMatch = cidadesList.some((c) =>
            building.Cidade?.toLowerCase().includes(c)
          );
        } else {
          // Se há apenas uma cidade
          isCidadeMatch = building.Cidade?.toLowerCase().includes(
            filters.cidade.toLowerCase()
          );
        }
      }

      // Verifica se deve filtrar por tipo (Lançamento)
      const typeParam = searchParams?.get("type");
      const lancamentoParam = searchParams?.get("lancamento");

      let isTypeMatch = true;

      if (typeParam) {
        isTypeMatch =
          building.TipoImovel?.toLowerCase() === typeParam.toLowerCase();
        if (
          typeParam.toLowerCase() === "lançamento" &&
          building.Lancamento === "Sim"
        ) {
          isTypeMatch = true; // Se é lançamento, também consideramos match
        }
      } else if (lancamentoParam === "sim") {
        isTypeMatch = building.Lancamento === "Sim";
        console.log(
          `Imóvel ${building.Codigo}: Lancamento=${building.Lancamento}, match=${isTypeMatch}`
        );
      }

      // Verifica se deve filtrar por categoria (Venda/Locação)
      const categoriaParam = searchParams?.get("categoria");
      let isCategoriaMatch = true;

      if (categoriaParam) {
        if (categoriaParam.toLowerCase() === "venda") {
          isCategoriaMatch = Number(building.ValorVenda || 0) > 0;
        } else if (
          categoriaParam.toLowerCase() === "locação" ||
          categoriaParam.toLowerCase() === "locacao"
        ) {
          isCategoriaMatch = Number(building.ValorLocacao || 0) > 0;
        }
      }

      return (
        isCodigoMatch &&
        isTipoImovelMatch &&
        isAreaMinMatch &&
        isAreaMaxMatch &&
        isValorMinMatch &&
        isValorMaxMatch &&
        isCaracteristicasMatch &&
        meetsDormFilter &&
        meetsSuiteFilter &&
        meetsVagaFilter &&
        isBairroMatch &&
        isCidadeMatch &&
        isExclusivoMatch &&
        isTypeMatch &&
        isCategoriaMatch
      );
    });

    console.log("Imóveis filtrados:", filtered.length);
    setFilteredBuildings(filtered);

    // Atualiza o número total de páginas com base nos imóveis filtrados
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));

    // Se a página atual for maior que o novo número total de páginas, voltar para a página 1
    if (currentPage > Math.ceil(filtered.length / PAGE_SIZE)) {
      setCurrentPage(1);
    }

    setShowFilters(false);
  }, [allBuildings, filters, searchParams, currentPage]);

  // Função para aplicar filtros da URL apenas uma vez
  const applyUrlFilters = useCallback(() => {
    if (
      !urlFiltersApplied &&
      allBuildings.length > 0 &&
      searchParams &&
      filtersInitialized
    ) {
      // Verificar se há algum parâmetro de filtro na URL
      const hasAnyFilter = Array.from(searchParams.keys()).length > 0;

      if (hasAnyFilter) {
        console.log("Aplicando filtros da URL pela primeira vez");
        handleApplyFilters();
        setUrlFiltersApplied(true);
      } else {
        // Se não há filtros na URL, mostrar todos os imóveis
        setFilteredBuildings(allBuildings);
        setTotalPages(Math.ceil(allBuildings.length / PAGE_SIZE));
      }
    }
  }, [
    allBuildings.length,
    searchParams,
    handleApplyFilters,
    filtersInitialized,
    urlFiltersApplied,
  ]);

  // Função para obter parâmetros da URL
  useEffect(() => {
    if (typeof window !== "undefined" && !filtersInitialized) {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);

      let newFilters = { ...filters };
      let hasChanged = false;

      // Verifica se há o parâmetro "Codigo" na URL
      const codigoFromUrl = params.get("Codigo");
      if (codigoFromUrl) {
        console.log("Filtro de código ativado:", codigoFromUrl);
        newFilters.Codigo = codigoFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "bairro" na URL
      const bairroFromUrl = params.get("bairro");
      if (bairroFromUrl) {
        console.log("Filtro de bairro ativado:", bairroFromUrl);
        // Verifica se o bairro contém uma vírgula, indicando múltiplos bairros
        if (bairroFromUrl.includes(",")) {
          const bairros = bairroFromUrl.split(",").map((b) => b.trim());
          newFilters.bairro = bairros.join(",");
        } else {
          newFilters.bairro = bairroFromUrl;
        }
        hasChanged = true;
      }

      // Verifica se há o parâmetro "cidade" na URL
      const cidadeFromUrl = params.get("cidade");
      if (cidadeFromUrl) {
        console.log("Filtro de cidade ativado:", cidadeFromUrl);
        newFilters.cidade = cidadeFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "tipoImovel" na URL
      const tipoImovelFromUrl = params.get("tipoImovel");
      if (tipoImovelFromUrl) {
        const tiposArray = tipoImovelFromUrl
          .split(",")
          .map((tipo) => tipo.trim());
        console.log("Filtro de tipo de imóvel ativado:", tiposArray);
        newFilters.tiposImovel = tiposArray;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "dormitories" na URL
      const dormitoriesFromUrl = params.get("dormitories");
      if (dormitoriesFromUrl) {
        console.log("Filtro de dormitórios ativado:", dormitoriesFromUrl);
        newFilters.dormitories = dormitoriesFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "suites" na URL
      const suitesFromUrl = params.get("suites");
      if (suitesFromUrl) {
        console.log("Filtro de suítes ativado:", suitesFromUrl);
        newFilters.suites = suitesFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "vagas" na URL
      const vagasFromUrl = params.get("vagas");
      if (vagasFromUrl) {
        console.log("Filtro de vagas ativado:", vagasFromUrl);
        newFilters.vagas = vagasFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "areaMin" na URL
      const areaMinFromUrl = params.get("areaMin");
      if (areaMinFromUrl) {
        console.log("Filtro de área mínima ativado:", areaMinFromUrl);
        newFilters.areaMin = areaMinFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "areaMax" na URL
      const areaMaxFromUrl = params.get("areaMax");
      if (areaMaxFromUrl) {
        console.log("Filtro de área máxima ativado:", areaMaxFromUrl);
        newFilters.areaMax = areaMaxFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "valorMin" na URL
      const valorMinFromUrl = params.get("valorMin");
      if (valorMinFromUrl) {
        console.log("Filtro de valor mínimo ativado:", valorMinFromUrl);
        newFilters.valorMin = valorMinFromUrl;
        hasChanged = true;
      }

      // Verifica se há o parâmetro "valorMax" na URL
      const valorMaxFromUrl = params.get("valorMax");
      if (valorMaxFromUrl) {
        console.log("Filtro de valor máximo ativado:", valorMaxFromUrl);
        newFilters.valorMax = valorMaxFromUrl;
        hasChanged = true;
      }

      // Verificar se há o parâmetro "caracteristicas" na URL
      const caracteristicasFromUrl = params.get("caracteristicas");
      if (caracteristicasFromUrl) {
        const caracteristicasArray = caracteristicasFromUrl
          .split(",")
          .map((c) => c.trim());
        console.log("Filtro de características ativado:", caracteristicasArray);
        newFilters.caracteristicas = caracteristicasArray;
        hasChanged = true;
      }

      // Verificar se há o parâmetro "lancamento" na URL
      const lancamentoFromUrl = params.get("lancamento");
      if (lancamentoFromUrl && lancamentoFromUrl.toLowerCase() === "sim") {
        console.log("Filtro de lançamento ativado:", lancamentoFromUrl);
        // Para que o filtro de lançamento funcione, definimos o type=Lançamento
        params.set("type", "Lançamento");
        setSearchParams(params);
        console.log(
          "URL params após ajuste:",
          Object.fromEntries(params.entries())
        );
        hasChanged = true;
      }

      if (hasChanged) {
        setFilters(newFilters);
      }

      setFiltersInitialized(true);
    }
  }, []); // Removida a dependência de filters e filtersInitialized para evitar ciclos

  // UseEffect para aplicar filtros da URL apenas uma vez
  useEffect(() => {
    applyUrlFilters();
  }, [applyUrlFilters]);

  const fetchBuildings = async () => {
    // Evita carregar os dados mais de uma vez
    if (dataLoaded || allBuildings.length > 0) {
      console.log("Dados já carregados, ignorando fetchBuildings");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Iniciando busca de imóveis...");

      // Array para armazenar todos os imóveis
      const allResults: any[] = [];
      let currentPageFetch = 1; // Página inicial
      let hasMore = true; // Flag para continuar buscando

      while (hasMore) {
        // Realiza a requisição para buscar imóveis paginados
        const response = await fetch(
          `/api/newBuilding?page=${currentPageFetch}&size=${PAGE_SIZE}`,
          {
            headers: { Accept: "application/json" },
            cache: "no-cache",
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar imóveis: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.message === "A pesquisa não retornou resultados.") {
          console.log("Nenhum resultado retornado. Finalizando busca.");
          break;
        }

        console.log(`Dados da página ${currentPageFetch}:`, data);

        const results = Array.isArray(data)
          ? data
          : data.results || Object.values(data);

        if (!Array.isArray(results)) {
          throw new Error("O retorno da API não é um array de imóveis.");
        }

        allResults.push(...results);

        const total = data.total || 0;
        hasMore = currentPageFetch * PAGE_SIZE < total;
        currentPageFetch++;
      }

      console.log("Todos os imóveis carregados:", allResults);

      const detailedPromises = allResults.map(async (building: any) => {
        try {
          const detailResponse = await fetch(
            `/api/property/${building.Codigo}`,
            {
              headers: { Accept: "application/json" },
            }
          );

          if (!detailResponse.ok) {
            console.warn(
              `Erro ao buscar detalhes para o imóvel ${building.Codigo}`
            );
            return building;
          }

          const detailData = await detailResponse.json();
          return { ...building, ...detailData }; // Merge dos detalhes no imóvel
        } catch (error) {
          console.error(
            `Erro ao buscar detalhes para o imóvel ${building.Codigo}:`,
            error
          );
          return building;
        }
      });

      const detailedBuildings = await Promise.all(detailedPromises);

      console.log("Imóveis com detalhes completos:", detailedBuildings.length);

      setAllBuildings(detailedBuildings);
      setDataLoaded(true);

      // Inicialmente, mostrar todos os imóveis se não há filtros da URL
      if (!searchParams || Array.from(searchParams.keys()).length === 0) {
        setFilteredBuildings(detailedBuildings);
        setTotalPages(Math.ceil(detailedBuildings.length / PAGE_SIZE));
      }
    } catch (error: any) {
      console.error("Erro ao buscar imóveis:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []); // Mantido sem dependências para carregar apenas uma vez

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      console.log(`Mudando para a página ${page}`);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Atualizar os imóveis exibidos quando a página muda
  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    console.log(
      `Atualizando para página ${currentPage}, exibindo imóveis de ${start} a ${
        end - 1
      }`
    );
  }, [currentPage, filteredBuildings.length]);

  // Cálculo dos imóveis a serem exibidos na página atual
  const currentBuildings = filteredBuildings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (allBuildings.length > 0) {
      const categoriasUnicas = Array.from(
        new Set(allBuildings.map((building) => building.Categoria))
      );

      // Extrair características dos imóveis
      const todasCaracteristicas = allBuildings.flatMap((building) =>
        building.Caracteristicas ? Object.keys(building.Caracteristicas) : []
      );

      // Extrair infraestrutura dos imóveis
      const todasInfraestruturas = allBuildings.flatMap((building) =>
        building.InfraEstrutura ? Object.keys(building.InfraEstrutura) : []
      );

      // Combinar características e infraestrutura
      const todasPropriedades = [
        ...todasCaracteristicas,
        ...todasInfraestruturas,
      ];
      const propriedadesUnicas = Array.from(new Set(todasPropriedades));

      console.log("Todas propriedades encontradas:", propriedadesUnicas);
      console.log("Lista de características do imóvel:", caracteristicasImovel);
      console.log("Lista de infraestrutura:", caracteristicasInfraestrutura);

      // Mostra propriedades que não estão em nenhuma lista
      const naoEncontradas = propriedadesUnicas.filter(
        (prop) =>
          !caracteristicasImovel.some(
            (item) => normalizeString(item) === normalizeString(prop)
          ) &&
          !caracteristicasInfraestrutura.some(
            (item) => normalizeString(item) === normalizeString(prop)
          )
      );

      console.log("Propriedades não mapeadas:", naoEncontradas);

      setAvailableFilters({
        tipoImovelOptions: categoriasUnicas,
        caracteristicasOptions: propriedadesUnicas,
      });
    }
  }, [allBuildings]);

  const handleClearAllFilters = () => {
    setFilters({
      tiposImovel: [],
      areaMin: "",
      areaMax: "",
      valorMin: "",
      valorMax: "",
      caracteristicas: [],
      dormitories: "",
      suites: "",
      vagas: "",
      bairro: "",
      cidade: "",
      Codigo: "",
    });
    // Mostrar todos os imóveis quando limpar os filtros
    setFilteredBuildings(allBuildings);
    setTotalPages(Math.ceil(allBuildings.length / PAGE_SIZE));
    setShowFilters(false);
    setCurrentPage(1);
  };

  const appliedFiltersList = getAppliedFilters(filters);

  // Componente otimizado para o card do imóvel
  const BuildingCard = memo(({ building }: { building: BuildingDetails }) => {
    const handleClick = useCallback(() => {
      console.log("Navegando para o imóvel:", building.Codigo);
      // Interromper qualquer chamada de API pendente
      setIsLoading(false);
      setDataLoaded(true);

      // Navegar para a página do imóvel
      router.push(`/place/${building.Codigo}`);
    }, [building.Codigo]);

    return (
      <div className={styles.card}>
        <div className={styles.imageContainer} onClick={handleClick}>
          <img
            src={(() => {
              const fotos = Object.values(building.Foto || {});
              // Primeiro, tenta encontrar a foto destacada
              const fotoDestaque = fotos.find(
                (foto: any) => foto?.Destaque === "Sim" && foto?.Foto
              )?.Foto;
              if (fotoDestaque) return fotoDestaque;

              // Se não encontrar a destacada, procura a primeira foto válida
              for (const foto of fotos) {
                if (foto?.Foto) return foto.Foto;
              }

              // Se não encontrar nenhuma foto válida, usa a imagem padrão
              return "/images/logo.svg";
            })()}
            alt={building.Categoria}
            className={styles.cardImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const currentSrc = target.src;

              // Se a imagem atual falhar, tenta encontrar outra foto válida
              if (currentSrc !== "/images/logo.svg") {
                const fotos = Object.values(building.Foto || {});
                // Filtra a foto atual que falhou
                const outrasfotos = fotos.filter(
                  (foto: any) => foto?.Foto && foto.Foto !== currentSrc
                );

                // Se encontrar outra foto, usa ela
                if (outrasfotos.length > 0) {
                  target.src = outrasfotos[0].Foto;
                } else {
                  // Se não encontrar nenhuma outra foto, usa a imagem padrão
                  target.src = "/images/logo.svg";
                }
              }
            }}
          />
        </div>

        <div className={styles.cardDetails} onClick={handleClick}>
          <h3>{building.Categoria}</h3>
          {building.ValorVenda && Number(building.ValorVenda) > 0 ? (
            <p>
              <strong>
                R${" "}
                {Number(building.ValorVenda).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </p>
          ) : (
            <p>
              <strong>Sob consulta</strong>
            </p>
          )}
          <p>
            {building.Bairro || "Bairro não informado"}, {building.Cidade}
          </p>
          <div className={styles.propertyInfo}>
            {building.AreaPrivativa && Number(building.AreaPrivativa) > 0 && (
              <div className={styles.infoItem}>
                <div className={styles.value}>{building.AreaPrivativa}m²</div>
                <div className={styles.label}>Área útil</div>
              </div>
            )}
            {!building.Suites || Number(building.Suites) === 0 ? (
              building.Dormitorios &&
              Number(building.Dormitorios) > 0 && (
                <div className={styles.infoItem}>
                  <div className={styles.value}>{building.Dormitorios}</div>
                  <div className={styles.label}>
                    {Number(building.Dormitorios) === 1 ? "Dorm." : "Dorms."}
                  </div>
                </div>
              )
            ) : (
              <div className={styles.infoItem}>
                <div className={styles.value}>{building.Suites}</div>
                <div className={styles.label}>
                  {Number(building.Suites) === 1 ? "Suíte" : "Suítes"}
                </div>
              </div>
            )}
            {building.Vagas && Number(building.Vagas) > 0 && (
              <div className={styles.infoItem}>
                <div className={styles.value}>{building.Vagas}</div>
                <div className={styles.label}>
                  {Number(building.Vagas) === 1 ? "Vaga" : "Vagas"}
                </div>
              </div>
            )}
          </div>
          <button
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation(); // Evita propagação do clique para o container
              handleClick();
            }}
          >
            Ver Mais
          </button>
        </div>
      </div>
    );
  });

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Botão e painel de Filtros */}
        <div className={styles.filtersContainer}>
          <button
            className={styles.filtersButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <MdOutlineFilterList size={20} style={{ marginRight: 8 }} />
            Filtros
          </button>

          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filtersPanelHeader}>
                <div className={styles.filterTitle}>
                  <MdOutlineFilterList size={18} />
                  <h3>Filtrar Imóveis</h3>
                </div>

                <p className={styles.activeFilters}>
                  Filtros aplicados: {appliedFiltersList.length}
                </p>

                <div className={styles.appliedFiltersContainer}>
                  {appliedFiltersList.map((item, idx) => (
                    <span key={idx} className={styles.appliedFilterItem}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.filtersPanelContent}>
                <div className={styles.filterGroup}>
                  <h4>
                    <FaBuilding style={{ marginRight: 4 }} />
                    Tipo do imóvel
                  </h4>
                  <div className={styles.columnOptions}>
                    {availableFilters.tipoImovelOptions.map((option) => (
                      <label key={option} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.tiposImovel.includes(option)}
                          onChange={() => {
                            if (filters.tiposImovel.includes(option)) {
                              const novoArray = filters.tiposImovel.filter(
                                (tipo) => tipo !== option
                              );
                              setFilters({
                                ...filters,
                                tiposImovel: novoArray,
                              });
                            } else {
                              const novoArray = [
                                ...filters.tiposImovel,
                                option,
                              ];
                              setFilters({
                                ...filters,
                                tiposImovel: novoArray,
                              });
                            }
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <FaBed style={{ marginRight: 4 }} />
                    Dormitórios
                  </h4>
                  <div className={styles.columnOptions}>
                    {["1", "2", "3", "4+"].map((option) => (
                      <label key={option} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="dorms"
                          value={option}
                          checked={filters.dormitories === option}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dormitories: e.target.value,
                            })
                          }
                        />
                        {option}
                      </label>
                    ))}
                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={() =>
                        setFilters({ ...filters, dormitories: "" })
                      }
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <FaCar style={{ marginRight: 4 }} />
                    Vagas
                  </h4>
                  <div className={styles.columnOptions}>
                    {["1", "2", "3", "4+"].map((option) => (
                      <label key={option} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="vagas"
                          value={option}
                          checked={filters.vagas === option}
                          onChange={(e) =>
                            setFilters({ ...filters, vagas: e.target.value })
                          }
                        />
                        {option}
                      </label>
                    ))}
                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={() => setFilters({ ...filters, vagas: "" })}
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <FaShower style={{ marginRight: 4 }} />
                    Suítes
                  </h4>
                  <div className={styles.columnOptions}>
                    {["1", "2", "3", "4+"].map((option) => (
                      <label key={option} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="suites"
                          value={option}
                          checked={filters.suites === option}
                          onChange={(e) =>
                            setFilters({ ...filters, suites: e.target.value })
                          }
                        />
                        {option}
                      </label>
                    ))}
                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={() => setFilters({ ...filters, suites: "" })}
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <FaVectorSquare style={{ marginRight: 4 }} />
                    Área
                  </h4>
                  <input
                    type="number"
                    placeholder="Área mínima"
                    value={filters.areaMin}
                    onChange={(e) =>
                      setFilters({ ...filters, areaMin: e.target.value })
                    }
                    className={styles.inputField}
                  />
                  <input
                    type="number"
                    placeholder="Área máxima"
                    value={filters.areaMax}
                    onChange={(e) =>
                      setFilters({ ...filters, areaMax: e.target.value })
                    }
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <FaMoneyBillWave style={{ marginRight: 4 }} />
                    Valor
                  </h4>
                  <input
                    type="number"
                    placeholder="Valor mínimo"
                    value={filters.valorMin}
                    onChange={(e) =>
                      setFilters({ ...filters, valorMin: e.target.value })
                    }
                    className={styles.inputField}
                  />
                  <input
                    type="number"
                    placeholder="Valor máximo"
                    value={filters.valorMax}
                    onChange={(e) =>
                      setFilters({ ...filters, valorMax: e.target.value })
                    }
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <FaListUl style={{ marginRight: 4 }} />
                    Características do imóvel
                  </h4>
                  <div
                    className={`${styles.characteristicsList} ${styles.columnOptions}`}
                  >
                    {availableFilters.caracteristicasOptions
                      .filter((charac) => {
                        // Verifica se a característica está na lista de características do imóvel
                        return caracteristicasImovel.some(
                          (item) =>
                            normalizeString(item) === normalizeString(charac)
                        );
                      })
                      .map((charac) => (
                        <label key={charac} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={filters.caracteristicas.includes(charac)}
                            onChange={() => {
                              const alreadySelected =
                                filters.caracteristicas.includes(charac);
                              if (alreadySelected) {
                                setFilters({
                                  ...filters,
                                  caracteristicas:
                                    filters.caracteristicas.filter(
                                      (c) => c !== charac
                                    ),
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  caracteristicas: [
                                    ...filters.caracteristicas,
                                    charac,
                                  ],
                                });
                              }
                            }}
                          />
                          {charac}
                        </label>
                      ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <FaListUl style={{ marginRight: 4 }} />
                    Características do Condomínio
                  </h4>
                  <div
                    className={`${styles.characteristicsList} ${styles.columnOptions}`}
                  >
                    {availableFilters.caracteristicasOptions
                      .filter((charac) => {
                        // Verifica se a característica está na lista de infraestrutura (condomínio)
                        return caracteristicasInfraestrutura.some(
                          (item) =>
                            normalizeString(item) === normalizeString(charac)
                        );
                      })
                      .map((charac) => (
                        <label key={charac} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={filters.caracteristicas.includes(charac)}
                            onChange={() => {
                              const alreadySelected =
                                filters.caracteristicas.includes(charac);
                              if (alreadySelected) {
                                setFilters({
                                  ...filters,
                                  caracteristicas:
                                    filters.caracteristicas.filter(
                                      (c) => c !== charac
                                    ),
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  caracteristicas: [
                                    ...filters.caracteristicas,
                                    charac,
                                  ],
                                });
                              }
                            }}
                          />
                          {charac}
                        </label>
                      ))}
                  </div>
                </div>
              </div>

              <div className={styles.filtersPanelFooter}>
                <button
                  className={styles.applyFiltersButton}
                  onClick={handleApplyFilters}
                >
                  Aplicar os filtros selecionados
                </button>
                <button
                  className={styles.clearAllButton}
                  onClick={handleClearAllFilters}
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinnerIcon} />
            <h2>Carregando imóveis...</h2>
            <p>Aguarde só um instante enquanto buscamos as melhores opções!</p>
          </div>
        ) : filteredBuildings.length === 0 ? (
          <div className={styles.noResultsContainer}>
            <FaRegFrownOpen size={50} />
            <h2>Ops! Não encontramos nenhum imóvel</h2>
            <p>Tente ajustar os filtros ou volte mais tarde.</p>
          </div>
        ) : (
          <>
            <div className={styles.cards}>
              {currentBuildings.map((building) => (
                <BuildingCard key={building.Codigo} building={building} />
              ))}
            </div>

            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              {currentPage > 3 && (
                <>
                  <button
                    className={`${styles.pageButton} ${
                      currentPage === 1 ? styles.activePage : ""
                    }`}
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className={styles.ellipsis}>...</span>
                  )}
                </>
              )}

              {Array.from({ length: 5 }, (_, index) => currentPage - 2 + index)
                .filter((page) => page >= 1 && page <= totalPages)
                .map((page) => (
                  <button
                    key={page}
                    className={`${styles.pageButton} ${
                      currentPage === page ? styles.activePage : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className={styles.ellipsis}>...</span>
                  )}
                  <button
                    className={`${styles.pageButton} ${
                      currentPage === totalPages ? styles.activePage : ""
                    }`}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
