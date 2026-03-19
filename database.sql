-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

-- DROP TYPE public."estado_mesa";

CREATE TYPE public."estado_mesa" AS ENUM (
	'LIBRE',
	'OCUPADA',
	'RESERVADA');

-- DROP TYPE public."estado_pedido";

CREATE TYPE public."estado_pedido" AS ENUM (
	'PENDIENTE_STOCK',
	'CANCELADO',
	'EN_PREPARACION',
	'LISTO',
	'ENTREGADO');

-- DROP TYPE public."metodo_pago";

CREATE TYPE public."metodo_pago" AS ENUM (
	'ONLINE_INMEDIATO',
	'CUENTA_ABIERTA_EFECTIVO',
	'CUENTA_ABIERTA_POSNET');

-- DROP TYPE public."rol_usuario";

CREATE TYPE public."rol_usuario" AS ENUM (
	'ADMIN',
	'MOZO',
	'COCINERO');

-- DROP SEQUENCE public.categorias_id_seq;

CREATE SEQUENCE public.categorias_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.lineas_pedido_id_seq;

CREATE SEQUENCE public.lineas_pedido_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.lineas_pedido_opciones_id_seq;

CREATE SEQUENCE public.lineas_pedido_opciones_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.mesas_id_seq;

CREATE SEQUENCE public.mesas_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.opciones_grupos_id_seq;

CREATE SEQUENCE public.opciones_grupos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.opciones_items_id_seq;

CREATE SEQUENCE public.opciones_items_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.pedidos_id_seq;

CREATE SEQUENCE public.pedidos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.productos_id_seq;

CREATE SEQUENCE public.productos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.sesiones_mesa_id_seq;

CREATE SEQUENCE public.sesiones_mesa_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.usuarios_id_seq;

CREATE SEQUENCE public.usuarios_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public.categorias definition

-- Drop table

-- DROP TABLE public.categorias;

CREATE TABLE public.categorias (
	id serial4 NOT NULL,
	nombre varchar(100) NOT NULL,
	destino varchar(20) DEFAULT 'BAR'::character varying NULL,
	CONSTRAINT categorias_nombre_key UNIQUE (nombre),
	CONSTRAINT categorias_pkey PRIMARY KEY (id)
);


-- public.mesas definition

-- Drop table

-- DROP TABLE public.mesas;

CREATE TABLE public.mesas (
	id serial4 NOT NULL,
	numero int4 NOT NULL,
	qr_token uuid DEFAULT gen_random_uuid() NULL,
	estado public."estado_mesa" DEFAULT 'LIBRE'::estado_mesa NULL,
	CONSTRAINT mesa_numero_unique UNIQUE (numero),
	CONSTRAINT mesas_numero_key UNIQUE (numero),
	CONSTRAINT mesas_pkey PRIMARY KEY (id),
	CONSTRAINT mesas_qr_token_key UNIQUE (qr_token)
);


-- public.opciones_grupos definition

-- Drop table

-- DROP TABLE public.opciones_grupos;

CREATE TABLE public.opciones_grupos (
	id serial4 NOT NULL,
	nombre varchar(100) NOT NULL,
	obligatorio bool DEFAULT false NULL,
	solo_una bool DEFAULT true NULL,
	CONSTRAINT opciones_grupos_pkey PRIMARY KEY (id)
);


-- public.usuarios definition

-- Drop table

-- DROP TABLE public.usuarios;

CREATE TABLE public.usuarios (
	id serial4 NOT NULL,
	nombre varchar(100) NOT NULL,
	email varchar(150) NOT NULL,
	password_hash text NOT NULL,
	rol public."rol_usuario" NOT NULL,
	CONSTRAINT usuarios_email_key UNIQUE (email),
	CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);


-- public.opciones_items definition

-- Drop table

-- DROP TABLE public.opciones_items;

CREATE TABLE public.opciones_items (
	id serial4 NOT NULL,
	grupo_id int4 NULL,
	nombre varchar(100) NOT NULL,
	precio_adicional numeric(10, 2) DEFAULT 0.00 NULL,
	CONSTRAINT opciones_items_pkey PRIMARY KEY (id),
	CONSTRAINT opciones_items_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.opciones_grupos(id) ON DELETE CASCADE
);


-- public.productos definition

-- Drop table

-- DROP TABLE public.productos;

CREATE TABLE public.productos (
	id serial4 NOT NULL,
	categoria_id int4 NULL,
	nombre varchar(150) NOT NULL,
	precio_actual numeric(10, 2) NOT NULL,
	stock_disponible int4 DEFAULT 0 NULL,
	activo bool DEFAULT true NULL,
	CONSTRAINT productos_pkey PRIMARY KEY (id),
	CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);


-- public.productos_opciones definition

-- Drop table

-- DROP TABLE public.productos_opciones;

CREATE TABLE public.productos_opciones (
	producto_id int4 NOT NULL,
	grupo_id int4 NOT NULL,
	CONSTRAINT productos_opciones_pkey PRIMARY KEY (producto_id, grupo_id),
	CONSTRAINT productos_opciones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.opciones_grupos(id) ON DELETE CASCADE,
	CONSTRAINT productos_opciones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE
);


-- public.sesiones_mesa definition

-- Drop table

-- DROP TABLE public.sesiones_mesa;

CREATE TABLE public.sesiones_mesa (
	id serial4 NOT NULL,
	mesa_id int4 NULL,
	apertura timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	cierre timestamp NULL,
	cant_comensales int4 DEFAULT 1 NULL,
	total_acumulado numeric(10, 2) DEFAULT 0.00 NULL,
	estado_sesion varchar(20) DEFAULT 'ACTIVA'::character varying NULL,
	CONSTRAINT sesiones_mesa_pkey PRIMARY KEY (id),
	CONSTRAINT sesiones_mesa_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id)
);


-- public.pedidos definition

-- Drop table

-- DROP TABLE public.pedidos;

CREATE TABLE public.pedidos (
	id serial4 NOT NULL,
	sesion_id int4 NULL,
	usuario_id int4 NULL,
	estado public."estado_pedido" DEFAULT 'PENDIENTE_STOCK'::estado_pedido NULL,
	"metodo_pago" public."metodo_pago" NOT NULL,
	pagado bool DEFAULT false NULL,
	subtotal numeric(10, 2) DEFAULT 0.00 NULL,
	creacion timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	motivo_cancelacion text NULL,
	CONSTRAINT pedidos_pkey PRIMARY KEY (id),
	CONSTRAINT pedidos_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES public.sesiones_mesa(id),
	CONSTRAINT pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);


-- public.lineas_pedido definition

-- Drop table

-- DROP TABLE public.lineas_pedido;

CREATE TABLE public.lineas_pedido (
	id serial4 NOT NULL,
	pedido_id int4 NULL,
	producto_id int4 NULL,
	cantidad int4 NOT NULL,
	precio_unitario_historico numeric(10, 2) NOT NULL,
	notas_especiales text NULL,
	CONSTRAINT lineas_pedido_pkey PRIMARY KEY (id),
	CONSTRAINT lineas_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE,
	CONSTRAINT lineas_pedido_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);


-- public.lineas_pedido_opciones definition

-- Drop table

-- DROP TABLE public.lineas_pedido_opciones;

CREATE TABLE public.lineas_pedido_opciones (
	id serial4 NOT NULL,
	linea_pedido_id int4 NULL,
	opcion_id int4 NULL,
	nombre_historico varchar(100) NULL,
	precio_historico numeric(10, 2) NULL,
	CONSTRAINT lineas_pedido_opciones_pkey PRIMARY KEY (id),
	CONSTRAINT lineas_pedido_opciones_linea_pedido_id_fkey FOREIGN KEY (linea_pedido_id) REFERENCES public.lineas_pedido(id) ON DELETE CASCADE,
	CONSTRAINT lineas_pedido_opciones_opcion_id_fkey FOREIGN KEY (opcion_id) REFERENCES public.opciones_items(id)
);