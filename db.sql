-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.objetos_perdidos (
  id integer NOT NULL DEFAULT nextval('objetos_perdidos_id_seq'::regclass),
  nome_responsavel character varying,
  objeto_perdido character varying,
  descricao_detalhada text,
  data_horario character varying,
  local_perdido character varying,
  possibilidade_levado character varying,
  nome_telefone_contato character varying,
  recompensa character varying,
  observacao text,
  fotos ARRAY,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT objetos_perdidos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pets_perdidos (
  id integer NOT NULL DEFAULT nextval('pets_perdidos_id_seq'::regclass),
  comprovante_path ARRAY,
  nome_pet character varying,
  tipo_pet character varying,
  raca character varying,
  bairro character varying,
  descricao text,
  cidade character varying,
  whatsapp character varying,
  img_path ARRAY,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  idade text,
  data_desaparecimento text,
  CONSTRAINT pets_perdidos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.propagandas (
  id integer NOT NULL DEFAULT nextval('propagandas_id_seq'::regclass),
  nome_empresa character varying NOT NULL,
  nome_responsavel character varying NOT NULL,
  telefone_contato_equipe character varying NOT NULL,
  telefone_empresa character varying NOT NULL,
  endereco character varying NOT NULL,
  tipo_negocio character varying NOT NULL,
  descricao_oferta text NOT NULL,
  formas_pagamento character varying NOT NULL,
  desconto_vista character varying NOT NULL,
  parcelas_cartao character varying NOT NULL,
  promocoes text,
  frase_destaque character varying,
  produto_destaque character varying,
  links_redes character varying,
  outras_informacoes text,
  materiais_divulgacao ARRAY,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT propagandas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reportagens (
  id integer NOT NULL DEFAULT nextval('reportagens_id_seq'::regclass),
  whatsapp character varying NOT NULL,
  cidade character varying NOT NULL,
  bairro character varying NOT NULL,
  problema text NOT NULL,
  img_path character varying,
  video_path character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reportagens_pkey PRIMARY KEY (id)
);