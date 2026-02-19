--
-- PostgreSQL database dump
--

\restrict gMRaIjWfrJ3Deredq9gixboM1nmYb5WpMK1m5eX5km6JTdJuUG6CEYSCDx4m3ig

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.recepciones DROP CONSTRAINT IF EXISTS recepciones_usuario_recibe_fkey;
ALTER TABLE IF EXISTS ONLY public.recepcion_detalles DROP CONSTRAINT IF EXISTS recepcion_detalles_ubicacion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recepcion_detalles DROP CONSTRAINT IF EXISTS recepcion_detalles_recepcion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recepcion_detalles DROP CONSTRAINT IF EXISTS recepcion_detalles_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_vendedor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_empacador_asignado_fkey;
ALTER TABLE IF EXISTS ONLY public.ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_aprobado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_alistador_asignado_fkey;
ALTER TABLE IF EXISTS ONLY public.orden_detalles DROP CONSTRAINT IF EXISTS orden_detalles_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orden_detalles DROP CONSTRAINT IF EXISTS orden_detalles_orden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.observaciones_proceso DROP CONSTRAINT IF EXISTS observaciones_proceso_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.observaciones_proceso DROP CONSTRAINT IF EXISTS observaciones_proceso_orden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.observaciones_proceso DROP CONSTRAINT IF EXISTS observaciones_proceso_detalle_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventario_ubicaciones DROP CONSTRAINT IF EXISTS inventario_ubicaciones_ubicacion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventario_ubicaciones DROP CONSTRAINT IF EXISTS inventario_ubicaciones_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS facturas_usuario_factura_fkey;
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS facturas_orden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_creado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.averias DROP CONSTRAINT IF EXISTS averias_ubicacion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.averias DROP CONSTRAINT IF EXISTS averias_reportado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.averias DROP CONSTRAINT IF EXISTS averias_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.averias DROP CONSTRAINT IF EXISTS averias_cerrado_por_fkey;
DROP TRIGGER IF EXISTS trigger_update_inventario_fecha ON public.inventario_ubicaciones;
DROP INDEX IF EXISTS public.idx_productos_codigo;
DROP INDEX IF EXISTS public.idx_ordenes_fecha;
DROP INDEX IF EXISTS public.idx_ordenes_estado;
DROP INDEX IF EXISTS public.idx_inventario_ubicacion;
DROP INDEX IF EXISTS public.idx_inventario_producto;
DROP INDEX IF EXISTS public.idx_clientes_nit;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.ubicaciones DROP CONSTRAINT IF EXISTS ubicaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.ubicaciones DROP CONSTRAINT IF EXISTS ubicaciones_codigo_key;
ALTER TABLE IF EXISTS ONLY public.recepciones DROP CONSTRAINT IF EXISTS recepciones_pkey;
ALTER TABLE IF EXISTS ONLY public.recepcion_detalles DROP CONSTRAINT IF EXISTS recepcion_detalles_pkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_pkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_codigo_key;
ALTER TABLE IF EXISTS ONLY public.ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_pkey;
ALTER TABLE IF EXISTS ONLY public.ordenes_venta DROP CONSTRAINT IF EXISTS ordenes_venta_numero_orden_key;
ALTER TABLE IF EXISTS ONLY public.orden_detalles DROP CONSTRAINT IF EXISTS orden_detalles_pkey;
ALTER TABLE IF EXISTS ONLY public.observaciones_proceso DROP CONSTRAINT IF EXISTS observaciones_proceso_pkey;
ALTER TABLE IF EXISTS ONLY public.inventario_ubicaciones DROP CONSTRAINT IF EXISTS inventario_ubicaciones_producto_id_ubicacion_id_key;
ALTER TABLE IF EXISTS ONLY public.inventario_ubicaciones DROP CONSTRAINT IF EXISTS inventario_ubicaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS facturas_pkey;
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS facturas_numero_factura_key;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_pkey;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_nit_cc_key;
ALTER TABLE IF EXISTS ONLY public.averias DROP CONSTRAINT IF EXISTS averias_pkey;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN usuario_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ubicaciones ALTER COLUMN ubicacion_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recepciones ALTER COLUMN recepcion_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recepcion_detalles ALTER COLUMN detalle_recepcion_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.productos ALTER COLUMN producto_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ordenes_venta ALTER COLUMN orden_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orden_detalles ALTER COLUMN detalle_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.observaciones_proceso ALTER COLUMN observacion_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventario_ubicaciones ALTER COLUMN inventario_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.facturas ALTER COLUMN factura_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clientes ALTER COLUMN cliente_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.averias ALTER COLUMN averia_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.usuarios_usuario_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.ubicaciones_ubicacion_id_seq;
DROP TABLE IF EXISTS public.ubicaciones;
DROP SEQUENCE IF EXISTS public.recepciones_recepcion_id_seq;
DROP TABLE IF EXISTS public.recepciones;
DROP SEQUENCE IF EXISTS public.recepcion_detalles_detalle_recepcion_id_seq;
DROP TABLE IF EXISTS public.recepcion_detalles;
DROP SEQUENCE IF EXISTS public.productos_producto_id_seq;
DROP TABLE IF EXISTS public.productos;
DROP SEQUENCE IF EXISTS public.ordenes_venta_orden_id_seq;
DROP TABLE IF EXISTS public.ordenes_venta;
DROP SEQUENCE IF EXISTS public.orden_detalles_detalle_id_seq;
DROP TABLE IF EXISTS public.orden_detalles;
DROP SEQUENCE IF EXISTS public.observaciones_proceso_observacion_id_seq;
DROP TABLE IF EXISTS public.observaciones_proceso;
DROP SEQUENCE IF EXISTS public.inventario_ubicaciones_inventario_id_seq;
DROP TABLE IF EXISTS public.inventario_ubicaciones;
DROP SEQUENCE IF EXISTS public.facturas_factura_id_seq;
DROP TABLE IF EXISTS public.facturas;
DROP SEQUENCE IF EXISTS public.clientes_cliente_id_seq;
DROP TABLE IF EXISTS public.clientes;
DROP SEQUENCE IF EXISTS public.averias_averia_id_seq;
DROP TABLE IF EXISTS public.averias;
DROP FUNCTION IF EXISTS public.update_fecha_actualizacion();
--
-- Name: update_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_fecha_actualizacion() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: averias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.averias (
    averia_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    tipo_averia character varying(20) NOT NULL,
    descripcion text,
    ubicacion_id integer,
    foto_url character varying(500),
    estado character varying(20) DEFAULT 'Abierta'::character varying,
    reportado_por integer NOT NULL,
    fecha_reporte timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cerrado_por integer,
    fecha_cierre timestamp without time zone,
    CONSTRAINT averias_estado_check CHECK (((estado)::text = ANY ((ARRAY['Abierta'::character varying, 'En_Revision'::character varying, 'Cerrada'::character varying])::text[]))),
    CONSTRAINT averias_tipo_averia_check CHECK (((tipo_averia)::text = ANY ((ARRAY['Daño'::character varying, 'Faltante'::character varying, 'Rotura'::character varying, 'Vencimiento'::character varying])::text[])))
);


ALTER TABLE public.averias OWNER TO postgres;

--
-- Name: averias_averia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.averias_averia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.averias_averia_id_seq OWNER TO postgres;

--
-- Name: averias_averia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.averias_averia_id_seq OWNED BY public.averias.averia_id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    cliente_id integer NOT NULL,
    nit_cc character varying(20) NOT NULL,
    razon_social character varying(200) NOT NULL,
    telefono character varying(20),
    email character varying(100),
    ciudad character varying(50),
    direccion text,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    creado_por integer
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_cliente_id_seq OWNER TO postgres;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_cliente_id_seq OWNED BY public.clientes.cliente_id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    factura_id integer NOT NULL,
    numero_factura character varying(50) NOT NULL,
    orden_id integer NOT NULL,
    fecha_factura date NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    descuentos numeric(12,2) DEFAULT 0,
    impuestos numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    usuario_factura integer NOT NULL,
    archivo_pdf character varying(500),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- Name: facturas_factura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_factura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_factura_id_seq OWNER TO postgres;

--
-- Name: facturas_factura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_factura_id_seq OWNED BY public.facturas.factura_id;


--
-- Name: inventario_ubicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario_ubicaciones (
    inventario_id integer NOT NULL,
    producto_id integer NOT NULL,
    ubicacion_id integer NOT NULL,
    cantidad integer DEFAULT 0,
    es_ubicacion_primaria boolean DEFAULT false,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventario_ubicaciones OWNER TO postgres;

--
-- Name: inventario_ubicaciones_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventario_ubicaciones_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventario_ubicaciones_inventario_id_seq OWNER TO postgres;

--
-- Name: inventario_ubicaciones_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventario_ubicaciones_inventario_id_seq OWNED BY public.inventario_ubicaciones.inventario_id;


--
-- Name: observaciones_proceso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.observaciones_proceso (
    observacion_id integer NOT NULL,
    orden_id integer NOT NULL,
    detalle_id integer,
    tipo_proceso character varying(20) NOT NULL,
    usuario_id integer NOT NULL,
    observacion text NOT NULL,
    foto_url character varying(500),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT observaciones_proceso_tipo_proceso_check CHECK (((tipo_proceso)::text = ANY ((ARRAY['Alistamiento'::character varying, 'Empaque'::character varying, 'Revision'::character varying])::text[])))
);


ALTER TABLE public.observaciones_proceso OWNER TO postgres;

--
-- Name: observaciones_proceso_observacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.observaciones_proceso_observacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.observaciones_proceso_observacion_id_seq OWNER TO postgres;

--
-- Name: observaciones_proceso_observacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.observaciones_proceso_observacion_id_seq OWNED BY public.observaciones_proceso.observacion_id;


--
-- Name: orden_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orden_detalles (
    detalle_id integer NOT NULL,
    orden_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad_pedida integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento_porcentaje numeric(5,2) DEFAULT 0,
    subtotal numeric(12,2) NOT NULL,
    comentarios_item text,
    cantidad_alistada integer DEFAULT 0,
    cantidad_empacada integer DEFAULT 0,
    alistamiento_completado boolean DEFAULT false,
    empaque_completado boolean DEFAULT false
);


ALTER TABLE public.orden_detalles OWNER TO postgres;

--
-- Name: orden_detalles_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orden_detalles_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orden_detalles_detalle_id_seq OWNER TO postgres;

--
-- Name: orden_detalles_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orden_detalles_detalle_id_seq OWNED BY public.orden_detalles.detalle_id;


--
-- Name: ordenes_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordenes_venta (
    orden_id integer NOT NULL,
    numero_orden character varying(50) NOT NULL,
    cliente_id integer NOT NULL,
    vendedor_id integer NOT NULL,
    estado character varying(30) DEFAULT 'Borrador'::character varying,
    subtotal numeric(12,2) DEFAULT 0,
    descuento_total numeric(12,2) DEFAULT 0,
    impuestos_total numeric(12,2) DEFAULT 0,
    total numeric(12,2) DEFAULT 0,
    comentarios text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion timestamp without time zone,
    aprobado_por integer,
    alistador_asignado integer,
    empacador_asignado integer,
    fecha_inicio_alistamiento timestamp without time zone,
    fecha_fin_alistamiento timestamp without time zone,
    fecha_inicio_empaque timestamp without time zone,
    fecha_fin_empaque timestamp without time zone,
    observacion_alistador text,
    observacion_empacador text,
    CONSTRAINT ordenes_venta_estado_check CHECK (((estado)::text = ANY ((ARRAY['Borrador'::character varying, 'Pendiente_Aprobacion'::character varying, 'Aprobada'::character varying, 'En_Alistamiento'::character varying, 'Listo_Para_Empacar'::character varying, 'En_Empaque'::character varying, 'Listo_Para_Despachar'::character varying, 'Lista_Facturar'::character varying, 'Facturada'::character varying, 'Rechazada'::character varying])::text[])))
);


ALTER TABLE public.ordenes_venta OWNER TO postgres;

--
-- Name: ordenes_venta_orden_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordenes_venta_orden_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordenes_venta_orden_id_seq OWNER TO postgres;

--
-- Name: ordenes_venta_orden_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordenes_venta_orden_id_seq OWNED BY public.ordenes_venta.orden_id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    producto_id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(200) NOT NULL,
    descripcion text,
    categoria character varying(100),
    precio_base numeric(10,2) NOT NULL,
    stock_actual integer DEFAULT 0,
    imagen_url character varying(500),
    activo boolean DEFAULT true
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_producto_id_seq OWNER TO postgres;

--
-- Name: productos_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_producto_id_seq OWNED BY public.productos.producto_id;


--
-- Name: recepcion_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recepcion_detalles (
    detalle_recepcion_id integer NOT NULL,
    recepcion_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad_recibida integer NOT NULL,
    ubicacion_id integer NOT NULL
);


ALTER TABLE public.recepcion_detalles OWNER TO postgres;

--
-- Name: recepcion_detalles_detalle_recepcion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recepcion_detalles_detalle_recepcion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recepcion_detalles_detalle_recepcion_id_seq OWNER TO postgres;

--
-- Name: recepcion_detalles_detalle_recepcion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recepcion_detalles_detalle_recepcion_id_seq OWNED BY public.recepcion_detalles.detalle_recepcion_id;


--
-- Name: recepciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recepciones (
    recepcion_id integer NOT NULL,
    numero_documento character varying(50) NOT NULL,
    proveedor character varying(200) NOT NULL,
    fecha_recepcion date NOT NULL,
    usuario_recibe integer NOT NULL,
    observaciones text,
    foto_soporte character varying(500),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recepciones OWNER TO postgres;

--
-- Name: recepciones_recepcion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recepciones_recepcion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recepciones_recepcion_id_seq OWNER TO postgres;

--
-- Name: recepciones_recepcion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recepciones_recepcion_id_seq OWNED BY public.recepciones.recepcion_id;


--
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicaciones (
    ubicacion_id integer NOT NULL,
    codigo character varying(20) NOT NULL,
    descripcion character varying(100),
    estanteria character varying(10),
    fila character varying(10),
    nivel character varying(10),
    orden_ruta integer DEFAULT 0,
    activa boolean DEFAULT true
);


ALTER TABLE public.ubicaciones OWNER TO postgres;

--
-- Name: ubicaciones_ubicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicaciones_ubicacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicaciones_ubicacion_id_seq OWNER TO postgres;

--
-- Name: ubicaciones_ubicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicaciones_ubicacion_id_seq OWNED BY public.ubicaciones.ubicacion_id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    telefono character varying(20),
    rol character varying(20) NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash character varying(255),
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['Vendedor'::character varying, 'Jefe_Bodega'::character varying, 'Alistador'::character varying, 'Empacador'::character varying, 'Facturacion'::character varying, 'Administrador'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_usuario_id_seq OWNER TO postgres;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_usuario_id_seq OWNED BY public.usuarios.usuario_id;


--
-- Name: averias averia_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.averias ALTER COLUMN averia_id SET DEFAULT nextval('public.averias_averia_id_seq'::regclass);


--
-- Name: clientes cliente_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN cliente_id SET DEFAULT nextval('public.clientes_cliente_id_seq'::regclass);


--
-- Name: facturas factura_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN factura_id SET DEFAULT nextval('public.facturas_factura_id_seq'::regclass);


--
-- Name: inventario_ubicaciones inventario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_ubicaciones ALTER COLUMN inventario_id SET DEFAULT nextval('public.inventario_ubicaciones_inventario_id_seq'::regclass);


--
-- Name: observaciones_proceso observacion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_proceso ALTER COLUMN observacion_id SET DEFAULT nextval('public.observaciones_proceso_observacion_id_seq'::regclass);


--
-- Name: orden_detalles detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_detalles ALTER COLUMN detalle_id SET DEFAULT nextval('public.orden_detalles_detalle_id_seq'::regclass);


--
-- Name: ordenes_venta orden_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta ALTER COLUMN orden_id SET DEFAULT nextval('public.ordenes_venta_orden_id_seq'::regclass);


--
-- Name: productos producto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN producto_id SET DEFAULT nextval('public.productos_producto_id_seq'::regclass);


--
-- Name: recepcion_detalles detalle_recepcion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_detalles ALTER COLUMN detalle_recepcion_id SET DEFAULT nextval('public.recepcion_detalles_detalle_recepcion_id_seq'::regclass);


--
-- Name: recepciones recepcion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepciones ALTER COLUMN recepcion_id SET DEFAULT nextval('public.recepciones_recepcion_id_seq'::regclass);


--
-- Name: ubicaciones ubicacion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones ALTER COLUMN ubicacion_id SET DEFAULT nextval('public.ubicaciones_ubicacion_id_seq'::regclass);


--
-- Name: usuarios usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuarios_usuario_id_seq'::regclass);


--
-- Data for Name: averias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.averias (averia_id, producto_id, cantidad, tipo_averia, descripcion, ubicacion_id, foto_url, estado, reportado_por, fecha_reporte, cerrado_por, fecha_cierre) FROM stdin;
5	2	3	Daño	Cabeza del martillo suelta	1	https://example.com/img/averia_martillo.jpg	Abierta	1	2025-10-21 07:14:02.692637	\N	\N
6	4	5	Faltante	Caja incompleta de guantes	2	https://example.com/img/averia_guantes.jpg	Abierta	1	2025-10-21 07:14:02.692637	\N	\N
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (cliente_id, nit_cc, razon_social, telefono, email, ciudad, direccion, activo, fecha_creacion, creado_por) FROM stdin;
1	900123456	Comercial Santa Fe S.A.	5711234567	contacto@santafe.com	Bogotá	Av. Caracas 123	t	2025-10-21 07:03:06.820894	1
2	800987654	Distribuciones El Norte Ltda.	6047654321	ventas@elnorte.com	Medellín	Cra 45 #12-45	t	2025-10-21 07:03:06.820894	1
3	901222333	Tienda Los Amigos	6025556677	losamigos@correo.com	Cali	Calle 10 #5-23	t	2025-10-21 07:03:06.820894	1
4	900123001	Ferretería Los Andes	6012345678	contacto@losandes.com	Bogotá	Cra 45 # 67-23	t	2025-10-24 08:43:53.605245	1
5	900123002	ConstruMarket SAS	6042233445	ventas@constru.com	Medellín	Calle 12 # 34-56	t	2025-10-24 08:43:53.605245	1
6	900123003	Tornillos y Más Ltda	6029988776	info@tornillosymas.com	Cali	Av 6N # 23-45	t	2025-10-24 08:43:53.605245	1
7	900123004	Distribuciones El Tornillo	6056677889	pedidos@eltornillo.com	Barranquilla	Calle 80 # 45-32	t	2025-10-24 08:43:53.605245	2
8	900123005	Herramientas del Norte	6078899001	contacto@norte.com	Bucaramanga	Carrera 22 # 14-11	t	2025-10-24 08:43:53.605245	1
9	900123456-1	Distribuidora El Éxito S.A.S	6012345678	contacto@exito.com	Bogotá	Calle 100 #15-20	t	2025-10-24 10:35:36.931537	1
10	800234567-2	Supermercados La Canasta	6013456789	ventas@canasta.com	Medellín	Carrera 50 #30-40	t	2025-10-24 10:35:36.939004	1
11	700345678-3	Comercial Los Andes Ltda	6014567890	info@losandes.com	Cali	Avenida 6N #25-50	t	2025-10-24 10:35:36.941505	1
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (factura_id, numero_factura, orden_id, fecha_factura, subtotal, descuentos, impuestos, total, usuario_factura, archivo_pdf, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: inventario_ubicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventario_ubicaciones (inventario_id, producto_id, ubicacion_id, cantidad, es_ubicacion_primaria, fecha_actualizacion) FROM stdin;
1	1	1	400	t	2025-10-21 07:14:21.560909
2	2	1	100	t	2025-10-21 07:14:21.560909
3	3	2	200	f	2025-10-21 07:14:21.560909
4	4	3	150	f	2025-10-21 07:14:21.560909
\.


--
-- Data for Name: observaciones_proceso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.observaciones_proceso (observacion_id, orden_id, detalle_id, tipo_proceso, usuario_id, observacion, foto_url, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: orden_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orden_detalles (detalle_id, orden_id, producto_id, cantidad_pedida, precio_unitario, descuento_porcentaje, subtotal, comentarios_item, cantidad_alistada, cantidad_empacada, alistamiento_completado, empaque_completado) FROM stdin;
9	4	1	2	25000.00	0.00	50000.00	Pedido estándar	0	0	f	f
10	3	2	2	38000.00	0.00	76000.00	Martillos reforzados	0	0	f	f
11	2	3	10	12000.00	5.00	114000.00	Descuento aplicado	0	0	f	f
12	3	4	3	8000.00	0.00	24000.00	Guantes adicionales	0	0	f	f
13	23	5	20	8500.00	0.00	170000.00	\N	0	0	f	f
14	23	6	50	3200.00	0.00	160000.00	\N	0	0	f	f
15	23	8	10	15000.00	0.00	150000.00	\N	0	0	f	f
21	27	7	40	2800.00	0.00	112000.00	\N	40	40	t	t
22	27	8	8	15000.00	0.00	120000.00	\N	8	0	t	f
18	26	5	15	8500.00	0.00	127500.00	\N	15	3	t	t
19	26	6	40	3200.00	0.00	128000.00	\N	40	4	t	t
20	26	9	12	12000.00	0.00	144000.00	\N	12	4	t	t
16	24	7	30	2800.00	0.00	84000.00	\N	4	0	t	f
17	24	9	15	12000.00	0.00	180000.00	\N	4	0	t	f
23	28	1	15	25000.00	0.00	375000.00	\N	15	0	t	f
24	28	2	25	38000.00	0.00	950000.00	\N	25	0	t	f
25	29	3	20	12000.00	0.00	240000.00	\N	20	0	t	f
26	29	4	5	8000.00	0.00	40000.00	\N	5	0	t	f
27	30	1	25	25000.00	0.00	625000.00	\N	25	0	t	f
28	30	2	40	38000.00	0.00	1520000.00	\N	40	0	t	f
29	30	5	10	8500.00	0.00	85000.00	\N	10	0	t	f
30	31	2	30	38000.00	0.00	1140000.00	\N	30	0	t	f
31	31	3	35	12000.00	0.00	420000.00	\N	35	0	t	f
32	31	4	8	8000.00	0.00	64000.00	\N	8	0	t	f
33	32	1	18	25000.00	0.00	450000.00	\N	0	0	f	f
34	32	5	12	8500.00	0.00	102000.00	\N	0	0	f	f
35	33	2	20	38000.00	0.00	760000.00	\N	20	0	t	f
36	33	3	25	12000.00	0.00	300000.00	\N	25	0	t	f
37	33	4	6	8000.00	0.00	48000.00	\N	0	0	f	f
38	34	4	8	8000.00	0.00	64000.00	\N	8	0	t	f
39	34	5	5	8500.00	0.00	42500.00	\N	5	0	t	f
40	35	1	20	25000.00	0.00	500000.00	\N	20	0	t	f
41	35	2	30	38000.00	0.00	1140000.00	\N	30	0	t	f
42	36	3	45	12000.00	0.00	540000.00	\N	45	0	t	f
43	36	4	12	8000.00	0.00	96000.00	\N	12	0	t	f
44	36	5	8	8500.00	0.00	68000.00	\N	8	0	t	f
45	37	2	22	38000.00	0.00	836000.00	\N	22	0	t	f
46	37	5	10	8500.00	0.00	85000.00	\N	10	0	t	f
47	38	1	25	25000.00	0.00	625000.00	\N	25	0	t	f
48	38	3	30	12000.00	0.00	360000.00	\N	30	0	t	f
49	39	2	28	38000.00	0.00	1064000.00	\N	28	28	t	t
50	39	4	10	8000.00	0.00	80000.00	\N	10	10	t	t
51	39	5	7	8500.00	0.00	59500.00	\N	7	0	t	f
52	40	1	12	25000.00	0.00	300000.00	\N	12	0	t	f
53	40	3	18	12000.00	0.00	216000.00	\N	18	0	t	f
54	41	2	50	38000.00	0.00	1900000.00	\N	50	0	t	f
55	41	4	15	8000.00	0.00	120000.00	\N	15	0	t	f
56	41	5	12	8500.00	0.00	102000.00	\N	12	0	t	f
57	42	1	10	25000.00	0.00	250000.00	\N	0	0	f	f
58	42	2	15	38000.00	0.00	570000.00	\N	0	0	f	f
59	42	3	20	12000.00	0.00	240000.00	\N	0	0	f	f
60	43	4	8	8000.00	0.00	64000.00	\N	0	0	f	f
61	43	5	12	8500.00	0.00	102000.00	\N	0	0	f	f
64	45	2	20	38000.00	0.00	760000.00	\N	20	0	t	f
65	45	4	15	8000.00	0.00	120000.00	\N	15	0	t	f
66	46	1	12	25000.00	0.00	300000.00	\N	12	0	t	f
67	46	3	18	12000.00	0.00	216000.00	\N	18	0	t	f
68	46	5	10	8500.00	0.00	85000.00	\N	10	0	t	f
62	44	1	25	25000.00	0.00	625000.00	\N	23	0	t	f
63	44	3	30	12000.00	0.00	360000.00	\N	24	0	t	f
\.


--
-- Data for Name: ordenes_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordenes_venta (orden_id, numero_orden, cliente_id, vendedor_id, estado, subtotal, descuento_total, impuestos_total, total, comentarios, fecha_creacion, fecha_aprobacion, aprobado_por, alistador_asignado, empacador_asignado, fecha_inicio_alistamiento, fecha_fin_alistamiento, fecha_inicio_empaque, fecha_fin_empaque, observacion_alistador, observacion_empacador) FROM stdin;
2	OV-1001	1	1	Aprobada	50000.00	0.00	9500.00	59500.00	Entrega rápida	2025-10-21 07:08:48.690962	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
18	OV-2002	2	1	Aprobada	64000.00	0.00	12160.00	76160.00	Cliente habitual con prioridad alta	2025-10-20 08:44:06.867191	2025-10-21 08:44:06.867191	1	2	3	2025-10-22 08:44:06.867191	2025-10-23 08:44:06.867191	\N	\N	Alistamiento sin problemas	\N
3	OV-1002	2	1	En_Alistamiento	76000.00	0.00	14440.00	90440.00	Cliente habitual	2025-10-21 07:08:48.690962	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
19	OV-2003	3	1	En_Alistamiento	92000.00	2000.00	17000.00	107000.00	Incluye productos frágiles	2025-10-22 08:44:06.867191	2025-10-22 08:44:06.867191	1	4	5	2025-10-23 08:44:06.867191	2025-10-24 08:44:06.867191	\N	\N	Producto A embalado, faltan etiquetas	\N
20	OV-2004	4	2	Listo_Para_Despachar	150000.00	0.00	28500.00	178500.00	Pedido corporativo urgente	2025-10-17 08:44:06.867191	2025-10-18 08:44:06.867191	2	3	4	2025-10-19 08:44:06.867191	2025-10-20 08:44:06.867191	2025-10-21 08:44:06.867191	2025-10-22 08:44:06.867191	Alistado y verificado	Empaque verificado, sin daños
4	OV-1003	3	1	Pendiente_Aprobacion	120000.00	5000.00	21900.00	136900.00	Pendiente de aprobación	2025-10-21 07:08:48.690962	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
17	OV-2001	1	2	Pendiente_Aprobacion	85000.00	0.00	16150.00	101150.00	Primera orden del mes	2025-10-19 08:44:06.867191	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
21	OV-2005	5	3	Facturada	210000.00	5000.00	38850.00	243850.00	Entrega completada con éxito	2025-10-14 08:44:06.867191	2025-10-15 08:44:06.867191	2	3	4	2025-10-16 08:44:06.867191	2025-10-17 08:44:06.867191	2025-10-18 08:44:06.867191	2025-10-19 08:44:06.867191	Todo correcto	Despachado sin incidentes
23	ORD-2024-001	9	13	Aprobada	500000.00	0.00	95000.00	595000.00	Pedido urgente	2025-10-24 10:37:24.593732	2025-10-23 10:37:24.593732	14	9	11	\N	\N	\N	\N	\N	\N
25	ORD-2024-003	11	13	En_Alistamiento	280000.00	0.00	53200.00	333200.00	Pedido regular	2025-10-24 10:37:24.612308	2025-10-23 10:37:24.612308	14	9	11	2025-10-24 08:37:24.612308	\N	\N	\N	\N	\N
27	ORD-2024-005	10	13	En_Empaque	320000.00	0.00	60800.00	380800.00	Cliente especial	2025-10-24 10:38:06.289203	2025-10-21 10:38:06.289203	14	9	12	2025-10-24 04:38:06.289203	2025-10-24 07:38:06.289203	2025-10-24 09:38:06.289203	\N	Productos OK	\N
26	ORD-2024-004	9	13	Listo_Para_Despachar	450000.00	0.00	85500.00	535500.00	Despachar pronto	2025-10-24 10:38:06.276895	2025-10-22 10:38:06.276895	14	10	11	2025-10-24 06:38:06.276895	2025-10-24 09:38:06.276895	2025-10-24 10:41:35.50992	2025-10-24 10:42:08.417847	Todo OK	Prueba 1
24	ORD-2024-002	10	13	Listo_Para_Empacar	350000.00	0.00	66500.00	416500.00	Cliente preferencial	2025-10-24 10:37:24.60633	2025-10-24 08:37:24.60633	14	10	12	2025-10-24 10:42:23.070025	2025-10-24 10:42:42.351487	\N	\N	prueba 1 alistador	\N
28	ORD-2024-006	1	13	Aprobada	250000.00	0.00	47500.00	297500.00	Pedido urgente para entrega inmediata	2025-10-24 10:49:33.397718	2025-10-23 10:49:33.387	14	9	11	\N	\N	\N	\N	\N	\N
30	ORD-2024-008	3	13	Aprobada	420000.00	0.00	79800.00	499800.00	Pedido grande - verificar stock	2025-10-24 10:49:33.411828	2025-10-23 10:49:33.387	14	9	11	\N	\N	\N	\N	\N	\N
32	ORD-2024-010	2	13	En_Alistamiento	275000.00	0.00	52250.00	327250.00	Despacho prioritario	2025-10-24 10:49:33.42074	2025-10-23 10:49:33.387	14	9	11	2025-10-24 10:19:33.387	\N	\N	\N	\N	\N
33	ORD-2024-011	3	13	En_Alistamiento	195000.00	0.00	37050.00	232050.00	Cliente VIP	2025-10-24 10:49:33.423702	2025-10-23 10:49:33.387	14	10	12	2025-10-24 09:49:33.387	\N	\N	\N	\N	\N
34	ORD-2024-012	1	13	Aprobada	155000.00	0.00	29450.00	184450.00	Pedido estándar	2025-10-24 10:49:33.429006	2025-10-23 10:49:33.387	14	9	11	\N	\N	\N	\N	\N	\N
35	ORD-2024-013	2	13	Listo_Para_Empacar	290000.00	0.00	55100.00	345100.00	Empaque especial requerido	2025-10-24 10:49:33.432204	2025-10-23 10:49:33.387	14	9	11	2025-10-24 07:49:33.387	2025-10-24 09:49:33.387	\N	\N	Productos listos para empacar	\N
36	ORD-2024-014	3	13	Listo_Para_Empacar	385000.00	0.00	73150.00	458150.00	Orden grande - múltiples cajas	2025-10-24 10:49:33.435722	2025-10-23 10:49:33.387	14	10	12	2025-10-24 06:49:33.387	2025-10-24 08:49:33.387	\N	\N	Todo OK, sin faltantes	\N
37	ORD-2024-015	1	13	Listo_Para_Empacar	215000.00	0.00	40850.00	255850.00	Envío urgente	2025-10-24 10:49:33.439638	2025-10-23 10:49:33.387	14	9	11	2025-10-24 08:49:33.387	2025-10-24 10:19:33.387	\N	\N	Alistamiento completo	\N
38	ORD-2024-016	2	13	En_Empaque	340000.00	0.00	64600.00	404600.00	Cliente corporativo	2025-10-24 10:49:33.442491	2025-10-23 10:49:33.387	14	10	12	2025-10-24 05:49:33.387	2025-10-24 07:49:33.387	2025-10-24 10:29:33.387	\N	Sin novedad	\N
39	ORD-2024-017	3	13	En_Empaque	268000.00	0.00	50920.00	318920.00	Despacho normal	2025-10-24 10:49:33.446267	2025-10-23 10:49:33.387	14	9	11	2025-10-24 04:49:33.387	2025-10-24 06:49:33.387	2025-10-24 09:49:33.387	\N	Productos en buen estado	\N
40	ORD-2024-018	1	13	Listo_Para_Empacar	175000.00	0.00	33250.00	208250.00	Pedido sencillo	2025-10-24 10:49:33.450115	2025-10-23 10:49:33.387	14	10	12	2025-10-24 08:49:33.387	2025-10-24 10:04:33.387	\N	\N	OK	\N
41	ORD-2024-019	2	13	Listo_Para_Empacar	425000.00	0.00	80750.00	505750.00	Pedido prioritario	2025-10-24 10:49:33.453336	2025-10-23 10:49:33.387	14	9	11	2025-10-24 05:49:33.387	2025-10-24 08:49:33.387	\N	\N	Alistamiento verificado	\N
31	ORD-2024-009	1	13	En_Alistamiento	310000.00	0.00	58900.00	368900.00	Reposición de inventario	2025-10-24 10:49:33.41681	2025-10-23 10:49:33.387	14	10	12	2025-10-24 10:53:28.841728	\N	\N	\N	\N	\N
29	ORD-2024-007	2	13	En_Alistamiento	180000.00	0.00	34200.00	214200.00	Cliente nuevo - primera orden	2025-10-24 10:49:33.407683	2025-10-23 10:49:33.387	14	10	12	2025-10-24 10:53:46.66024	\N	\N	\N	\N	\N
45	ORD-2024-023	1	13	Listo_Para_Empacar	880000.00	0.00	167200.00	1047200.00	Pedido listo para empacar	2025-10-24 11:01:05.172146	2025-10-23 11:01:05.145	14	9	11	2025-10-24 08:01:05.145	2025-10-24 10:01:05.145	\N	\N	Alistamiento completado sin problemas	\N
46	ORD-2024-024	2	13	Listo_Para_Empacar	601000.00	0.00	114190.00	715190.00	Orden lista para empaque	2025-10-24 11:01:05.175941	2025-10-23 11:01:05.145	14	10	12	2025-10-24 08:01:05.145	2025-10-24 10:01:05.145	\N	\N	Todo OK	\N
43	ORD-2024-021	2	13	En_Alistamiento	166000.00	0.00	31540.00	197540.00	Orden lista para iniciar	2025-10-24 11:01:05.164948	2025-10-23 11:01:05.145	14	10	12	2025-10-24 11:01:33.192174	\N	\N	\N	\N	\N
44	ORD-2024-022	3	13	Listo_Para_Empacar	985000.00	0.00	187150.00	1172150.00	Pedido urgente sin procesar	2025-10-24 11:01:05.168693	2025-10-23 11:01:05.145	14	9	11	2025-10-24 11:29:42.958703	2025-10-24 11:30:09.32195	\N	\N	prueba 1 alistamiento	\N
42	ORD-2024-020	1	13	En_Alistamiento	1060000.00	0.00	201400.00	1261400.00	Orden nueva para comenzar alistamiento	2025-10-24 11:01:05.152568	2025-10-23 11:01:05.145	14	9	11	2025-10-24 11:30:14.07553	\N	\N	\N	\N	\N
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (producto_id, codigo, nombre, descripcion, categoria, precio_base, stock_actual, imagen_url, activo) FROM stdin;
1	PRD-001	Caja de tornillos	Caja con 100 tornillos galvanizados	Ferretería	25000.00	500	https://example.com/img/tornillos.jpg	t
2	PRD-002	Martillo de acero	Martillo de 16oz con mango ergonómico	Ferretería	38000.00	150	https://example.com/img/martillo.jpg	t
3	PRD-003	Destornillador plano	Destornillador de 6 pulgadas	Ferretería	12000.00	300	https://example.com/img/destornillador.jpg	t
4	PRD-004	Guantes de seguridad	Par de guantes industriales	Seguridad	8000.00	200	https://example.com/img/guantes.jpg	t
5	PROD-001	Aceite de Cocina 1L	\N	Alimentos	8500.00	500	\N	t
6	PROD-002	Arroz Blanco 1kg	\N	Alimentos	3200.00	500	\N	t
7	PROD-003	Azúcar Refinada 1kg	\N	Alimentos	2800.00	500	\N	t
8	PROD-004	Papel Higiénico x12	\N	Aseo	15000.00	500	\N	t
9	PROD-005	Detergente en Polvo 1kg	\N	Aseo	12000.00	500	\N	t
\.


--
-- Data for Name: recepcion_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recepcion_detalles (detalle_recepcion_id, recepcion_id, producto_id, cantidad_recibida, ubicacion_id) FROM stdin;
1	1	1	200	1
2	1	2	50	1
3	2	3	100	2
\.


--
-- Data for Name: recepciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recepciones (recepcion_id, numero_documento, proveedor, fecha_recepcion, usuario_recibe, observaciones, foto_soporte, fecha_creacion) FROM stdin;
1	RC-001	Proveedor Industrial S.A.	2025-10-15	2	Todo en buen estado	\N	2025-10-21 07:12:27.469251
2	RC-002	Suministros Técnicos Ltda.	2025-10-17	2	Revisión pendiente de martillos	\N	2025-10-21 07:12:27.469251
\.


--
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicaciones (ubicacion_id, codigo, descripcion, estanteria, fila, nivel, orden_ruta, activa) FROM stdin;
1	UB-001	Estante principal	A	1	1	1	t
2	UB-002	Zona de seguridad	A	2	1	2	t
3	UB-003	Bodega externa	B	1	2	3	t
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (usuario_id, nombre, email, telefono, rol, activo, fecha_creacion, password_hash) FROM stdin;
1	María García	maria@wms.com	3009876543	Jefe_Bodega	t	2025-10-02 09:20:41.389469	$2b$10$Y6mGKwj3BQdGYyfEfMzIY.K1wilLN/d09O6UWqQi5SJs.ZFBBBD8e
2	Maria Dell	mariadell@wms.com	34456788	Vendedor	t	2025-10-08 08:44:17.020439	$2b$10$uBAIIIYwlC.lZMIa66qlau3K5DH7viz00UpKEw.nF29p.kwq0n79e
3	Carlos Pérez	carlos@empresa.com	3001112233	Vendedor	t	2025-10-24 08:42:48.664629	\N
4	Ana Gómez	ana@empresa.com	3002223344	Administrador	t	2025-10-24 08:42:48.664629	\N
5	Luis Torres	luis@empresa.com	3003334455	Alistador	t	2025-10-24 08:42:48.664629	\N
6	María López	maria@empresa.com	3004445566	Empacador	t	2025-10-24 08:42:48.664629	\N
7	Sofía Ramírez	sofia@empresa.com	3005556677	Facturacion	t	2025-10-24 08:42:48.664629	\N
8	Pedro Díaz	pedro@empresa.com	3006667788	Jefe_Bodega	t	2025-10-24 08:42:48.664629	\N
9	Juan Pérez	alistador1@wms.com	3001234567	Alistador	t	2025-10-24 10:33:55.045286	$2b$10$PZMjV4cEz310Jozgw5W4iudLou4215nnUsOZMwpovXtzYFMVAMnHy
10	María García	alistador2@wms.com	3001234568	Alistador	t	2025-10-24 10:33:55.141814	$2b$10$jJQ23U4X9v4F0VuI4TT9O.AYxHULOYWXmvx3DnWZO901CICMFSLRW
11	Carlos Rodríguez	empacador1@wms.com	3001234569	Empacador	t	2025-10-24 10:33:55.23277	$2b$10$cu0ugIYdB9eAG7f9/e52n.ULiEYZ.O8g1s9jsgbEfk.2Si9r6gH0W
12	Ana Martínez	empacador2@wms.com	3001234570	Empacador	t	2025-10-24 10:33:55.327576	$2b$10$g1XR.epBDVmUXCrlLQtEDOwrPxhn/h9kkUYAMOYAw.UFBkXZCkGHC
13	Luis Sánchez	vendedor1@wms.com	3001234571	Vendedor	t	2025-10-24 10:33:55.423446	$2b$10$pvwNjXhf.Q3c3ukq60ilk.Uce9Ipubr/6IILddYlBL0ZlT7XbXPCS
14	Sofia López	jefe@wms.com	3001234572	Jefe_Bodega	t	2025-10-24 10:33:55.517791	$2b$10$olsiMO9iOy/QofFWwZ.55.EtHJEJi00siaevE.Uym89vQVrvRxfwq
\.


--
-- Name: averias_averia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.averias_averia_id_seq', 6, true);


--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_cliente_id_seq', 11, true);


--
-- Name: facturas_factura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_factura_id_seq', 2, true);


--
-- Name: inventario_ubicaciones_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventario_ubicaciones_inventario_id_seq', 4, true);


--
-- Name: observaciones_proceso_observacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.observaciones_proceso_observacion_id_seq', 20, true);


--
-- Name: orden_detalles_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orden_detalles_detalle_id_seq', 68, true);


--
-- Name: ordenes_venta_orden_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordenes_venta_orden_id_seq', 46, true);


--
-- Name: productos_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_producto_id_seq', 9, true);


--
-- Name: recepcion_detalles_detalle_recepcion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recepcion_detalles_detalle_recepcion_id_seq', 3, true);


--
-- Name: recepciones_recepcion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recepciones_recepcion_id_seq', 2, true);


--
-- Name: ubicaciones_ubicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicaciones_ubicacion_id_seq', 3, true);


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_id_seq', 14, true);


--
-- Name: averias averias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.averias
    ADD CONSTRAINT averias_pkey PRIMARY KEY (averia_id);


--
-- Name: clientes clientes_nit_cc_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_nit_cc_key UNIQUE (nit_cc);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (cliente_id);


--
-- Name: facturas facturas_numero_factura_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_numero_factura_key UNIQUE (numero_factura);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (factura_id);


--
-- Name: inventario_ubicaciones inventario_ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_ubicaciones
    ADD CONSTRAINT inventario_ubicaciones_pkey PRIMARY KEY (inventario_id);


--
-- Name: inventario_ubicaciones inventario_ubicaciones_producto_id_ubicacion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_ubicaciones
    ADD CONSTRAINT inventario_ubicaciones_producto_id_ubicacion_id_key UNIQUE (producto_id, ubicacion_id);


--
-- Name: observaciones_proceso observaciones_proceso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_proceso
    ADD CONSTRAINT observaciones_proceso_pkey PRIMARY KEY (observacion_id);


--
-- Name: orden_detalles orden_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_detalles
    ADD CONSTRAINT orden_detalles_pkey PRIMARY KEY (detalle_id);


--
-- Name: ordenes_venta ordenes_venta_numero_orden_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta
    ADD CONSTRAINT ordenes_venta_numero_orden_key UNIQUE (numero_orden);


--
-- Name: ordenes_venta ordenes_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta
    ADD CONSTRAINT ordenes_venta_pkey PRIMARY KEY (orden_id);


--
-- Name: productos productos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_codigo_key UNIQUE (codigo);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (producto_id);


--
-- Name: recepcion_detalles recepcion_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_detalles
    ADD CONSTRAINT recepcion_detalles_pkey PRIMARY KEY (detalle_recepcion_id);


--
-- Name: recepciones recepciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepciones
    ADD CONSTRAINT recepciones_pkey PRIMARY KEY (recepcion_id);


--
-- Name: ubicaciones ubicaciones_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT ubicaciones_codigo_key UNIQUE (codigo);


--
-- Name: ubicaciones ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT ubicaciones_pkey PRIMARY KEY (ubicacion_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id);


--
-- Name: idx_clientes_nit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clientes_nit ON public.clientes USING btree (nit_cc);


--
-- Name: idx_inventario_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventario_producto ON public.inventario_ubicaciones USING btree (producto_id);


--
-- Name: idx_inventario_ubicacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventario_ubicacion ON public.inventario_ubicaciones USING btree (ubicacion_id);


--
-- Name: idx_ordenes_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordenes_estado ON public.ordenes_venta USING btree (estado);


--
-- Name: idx_ordenes_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordenes_fecha ON public.ordenes_venta USING btree (fecha_creacion);


--
-- Name: idx_productos_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_codigo ON public.productos USING btree (codigo);


--
-- Name: inventario_ubicaciones trigger_update_inventario_fecha; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_inventario_fecha BEFORE UPDATE ON public.inventario_ubicaciones FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();


--
-- Name: averias averias_cerrado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.averias
    ADD CONSTRAINT averias_cerrado_por_fkey FOREIGN KEY (cerrado_por) REFERENCES public.usuarios(usuario_id);


--
-- Name: averias averias_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.averias
    ADD CONSTRAINT averias_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- Name: averias averias_reportado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.averias
    ADD CONSTRAINT averias_reportado_por_fkey FOREIGN KEY (reportado_por) REFERENCES public.usuarios(usuario_id);


--
-- Name: averias averias_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.averias
    ADD CONSTRAINT averias_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(ubicacion_id);


--
-- Name: clientes clientes_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(usuario_id);


--
-- Name: facturas facturas_orden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES public.ordenes_venta(orden_id);


--
-- Name: facturas facturas_usuario_factura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_usuario_factura_fkey FOREIGN KEY (usuario_factura) REFERENCES public.usuarios(usuario_id);


--
-- Name: inventario_ubicaciones inventario_ubicaciones_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_ubicaciones
    ADD CONSTRAINT inventario_ubicaciones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- Name: inventario_ubicaciones inventario_ubicaciones_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_ubicaciones
    ADD CONSTRAINT inventario_ubicaciones_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(ubicacion_id);


--
-- Name: observaciones_proceso observaciones_proceso_detalle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_proceso
    ADD CONSTRAINT observaciones_proceso_detalle_id_fkey FOREIGN KEY (detalle_id) REFERENCES public.orden_detalles(detalle_id);


--
-- Name: observaciones_proceso observaciones_proceso_orden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_proceso
    ADD CONSTRAINT observaciones_proceso_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES public.ordenes_venta(orden_id);


--
-- Name: observaciones_proceso observaciones_proceso_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_proceso
    ADD CONSTRAINT observaciones_proceso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- Name: orden_detalles orden_detalles_orden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_detalles
    ADD CONSTRAINT orden_detalles_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES public.ordenes_venta(orden_id);


--
-- Name: orden_detalles orden_detalles_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_detalles
    ADD CONSTRAINT orden_detalles_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- Name: ordenes_venta ordenes_venta_alistador_asignado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta
    ADD CONSTRAINT ordenes_venta_alistador_asignado_fkey FOREIGN KEY (alistador_asignado) REFERENCES public.usuarios(usuario_id);


--
-- Name: ordenes_venta ordenes_venta_aprobado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta
    ADD CONSTRAINT ordenes_venta_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(usuario_id);


--
-- Name: ordenes_venta ordenes_venta_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta
    ADD CONSTRAINT ordenes_venta_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id);


--
-- Name: ordenes_venta ordenes_venta_empacador_asignado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta
    ADD CONSTRAINT ordenes_venta_empacador_asignado_fkey FOREIGN KEY (empacador_asignado) REFERENCES public.usuarios(usuario_id);


--
-- Name: ordenes_venta ordenes_venta_vendedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_venta
    ADD CONSTRAINT ordenes_venta_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.usuarios(usuario_id);


--
-- Name: recepcion_detalles recepcion_detalles_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_detalles
    ADD CONSTRAINT recepcion_detalles_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- Name: recepcion_detalles recepcion_detalles_recepcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_detalles
    ADD CONSTRAINT recepcion_detalles_recepcion_id_fkey FOREIGN KEY (recepcion_id) REFERENCES public.recepciones(recepcion_id);


--
-- Name: recepcion_detalles recepcion_detalles_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_detalles
    ADD CONSTRAINT recepcion_detalles_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(ubicacion_id);


--
-- Name: recepciones recepciones_usuario_recibe_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepciones
    ADD CONSTRAINT recepciones_usuario_recibe_fkey FOREIGN KEY (usuario_recibe) REFERENCES public.usuarios(usuario_id);


--
-- PostgreSQL database dump complete
--

\unrestrict gMRaIjWfrJ3Deredq9gixboM1nmYb5WpMK1m5eX5km6JTdJuUG6CEYSCDx4m3ig

