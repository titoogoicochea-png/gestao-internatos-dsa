export interface AnexoCSubdim {
  id: string;
  codigo: string; // "1.1", "1.2", etc.
  titulo_es: string;
  titulo_pt: string;
  dimNum: string;
  dimTitulo_es: string;
}

export const ANEXO_C_DIMS = [
  { num: "1", titulo_es: "Dimensión Espiritual/Misión",         titulo_pt: "Dimensão Espiritual/Missão" },
  { num: "2", titulo_es: "Gestión Institucional",               titulo_pt: "Gestão Institucional" },
  { num: "3", titulo_es: "Gestión Pedagógica",                  titulo_pt: "Gestão Pedagógica" },
  { num: "4", titulo_es: "Gestión Administrativa",              titulo_pt: "Gestão Administrativa" },
  { num: "5", titulo_es: "Formación y Convivencia Comunitaria", titulo_pt: "Formação e Convivência Comunitária" },
];

export const ANEXO_C_SUBDIMS: AnexoCSubdim[] = [
  { id: "s1-1", codigo: "1.1", dimNum: "1", dimTitulo_es: "Dimensión Espiritual/Misión",         titulo_es: "Filosofía y Misión",                                                   titulo_pt: "Filosofia e Missão" },
  { id: "s1-2", codigo: "1.2", dimNum: "1", dimTitulo_es: "Dimensión Espiritual/Misión",         titulo_es: "Desarrollo Espiritual",                                                titulo_pt: "Desenvolvimento Espiritual" },
  { id: "s1-3", codigo: "1.3", dimNum: "1", dimTitulo_es: "Dimensión Espiritual/Misión",         titulo_es: "Evangelismo y Testimonio",                                             titulo_pt: "Evangelismo e Testemunho" },
  { id: "s1-4", codigo: "1.4", dimNum: "1", dimTitulo_es: "Dimensión Espiritual/Misión",         titulo_es: "Vitalidad Confesional — Índice de Volatilidad Confesional (IVC)",       titulo_pt: "Vitalidade Confessional — IVC" },
  { id: "s2-1", codigo: "2.1", dimNum: "2", dimTitulo_es: "Gestión Institucional",               titulo_es: "Aspectos Legales",                                                     titulo_pt: "Aspectos Legais" },
  { id: "s2-2", codigo: "2.2", dimNum: "2", dimTitulo_es: "Gestión Institucional",               titulo_es: "Planificación Estratégica",                                            titulo_pt: "Planejamento Estratégico" },
  { id: "s2-3", codigo: "2.3", dimNum: "2", dimTitulo_es: "Gestión Institucional",               titulo_es: "Liderazgo del Equipo de Gestión",                                      titulo_pt: "Liderança da Equipe de Gestão" },
  { id: "s2-4", codigo: "2.4", dimNum: "2", dimTitulo_es: "Gestión Institucional",               titulo_es: "Gestión de Resultados",                                                titulo_pt: "Gestão de Resultados" },
  { id: "s3-1", codigo: "3.1", dimNum: "3", dimTitulo_es: "Gestión Pedagógica",                  titulo_es: "Gestión de la Enseñanza",                                              titulo_pt: "Gestão de Ensino" },
  { id: "s3-2", codigo: "3.2", dimNum: "3", dimTitulo_es: "Gestión Pedagógica",                  titulo_es: "Gestión del Aprendizaje",                                              titulo_pt: "Gestão da Aprendizagem" },
  { id: "s3-3", codigo: "3.3", dimNum: "3", dimTitulo_es: "Gestión Pedagógica",                  titulo_es: "Gestión de la Investigación e Innovación Educativa",                   titulo_pt: "Gestão da Pesquisa e Inovação Educacional" },
  { id: "s4-1", codigo: "4.1", dimNum: "4", dimTitulo_es: "Gestión Administrativa",              titulo_es: "Gestión del Equipo",                                                   titulo_pt: "Gestão da Equipe" },
  { id: "s4-2", codigo: "4.2", dimNum: "4", dimTitulo_es: "Gestión Administrativa",              titulo_es: "Gestión de Recursos Financieros",                                      titulo_pt: "Gestão de Recursos Financeiros" },
  { id: "s4-3", codigo: "4.3", dimNum: "4", dimTitulo_es: "Gestión Administrativa",              titulo_es: "Infraestructura e Inversiones",                                        titulo_pt: "Infraestrutura e Investimentos" },
  { id: "s4-4", codigo: "4.4", dimNum: "4", dimTitulo_es: "Gestión Administrativa",              titulo_es: "Gestión de Recursos Educativos",                                       titulo_pt: "Gestão de Recursos Educacionais" },
  { id: "s5-1", codigo: "5.1", dimNum: "5", dimTitulo_es: "Formación y Convivencia Comunitaria", titulo_es: "Formación y Desarrollo Ciudadano",                                      titulo_pt: "Formação e Desenvolvimento Cidadão" },
  { id: "s5-2", codigo: "5.2", dimNum: "5", dimTitulo_es: "Formación y Convivencia Comunitaria", titulo_es: "Convivencia y Clima Escolar",                                           titulo_pt: "Convivência e Clima Escolar" },
];
