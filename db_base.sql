/* CREATE DATABASE juego_intro_ingenieria */

CREATE SEQUENCE usuario_id_seq;
CREATE TABLE usuario (
    id_usuario      INTEGER PRIMARY KEY DEFAULT nextval('usuario_id_seq'),
    pass_hash       TEXT NOT NULL,
    id_persona      INTEGER NOT NULL UNIQUE,
    id_rol          INTEGER NOT NULL,
    ultima_ip       TEXT,
    token_s         TEXT,
    token_rc        TEXT,
    vigente         BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER SEQUENCE usuario_id_seq OWNED BY usuario.id_usuario;

CREATE SEQUENCE rol_id_seq;
CREATE TABLE rol (
    id_rol      INTEGER PRIMARY KEY DEFAULT nextval('rol_id_seq'),
    nombre_rol  TEXT NOT NULL UNIQUE
);
ALTER SEQUENCE rol_id_seq OWNED BY rol.id_rol;

CREATE SEQUENCE persona_id_seq;
CREATE TABLE persona (
    id_persona  INTEGER PRIMARY KEY DEFAULT nextval('persona_id_seq'),
    rut         TEXT NOT NULL UNIQUE,
    nombre      TEXT NOT NULL,
    apellido_p  TEXT NOT NULL,
    apellido_m  TEXT,
    correo_ucn  TEXT NOT NULL UNIQUE,
    user_created    BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER SEQUENCE persona_id_seq OWNED BY persona.id_persona;

CREATE TABLE alumno (
    id_alumno   INTEGER PRIMARY KEY,
    id_carrera  INTEGER NOT NULL,
    vigente     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE SEQUENCE carrera_id_seq;
CREATE TABLE carrera (
    id_carrera      INTEGER PRIMARY KEY DEFAULT nextval('carrera_id_seq'),
    nombre_carrera  TEXT NOT NULL UNIQUE,
    vigente         BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER SEQUENCE carrera_id_seq OWNED BY carrera.id_carrera;

CREATE TABLE profesor (
    id_profesor INTEGER PRIMARY KEY,
    vigente     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE SEQUENCE juego_id_seq;
CREATE TABLE juego (
    id_juego        INTEGER PRIMARY KEY DEFAULT nextval('juego_id_seq'),
    nombre          TEXT NOT NULL,
    semestre        TEXT NOT NULL,
    concluido       BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_inicio    TIMESTAMP NOT NULL,
    fecha_termino   TIMESTAMP
);
ALTER SEQUENCE juego_id_seq OWNED BY juego.id_juego;

CREATE TABLE config_juego (
    id_juego                        INTEGER PRIMARY KEY,
    dinero_inicial                  INTEGER NOT NULL,
    veces_compra_ciudad_dia         INTEGER NOT NULL,
    se_puede_comerciar              BOOLEAN NOT NULL DEFAULT FALSE,
    se_puede_comprar_bloques        BOOLEAN NOT NULL DEFAULT TRUE,
    max_bloques_camion              INTEGER NOT NULL,
    max_bloques_bodega              INTEGER NOT NULL,
    precio_bloque_extra             INTEGER NOT NULL,
    freq_cobro_bloque_extra_dias    INTEGER NOT NULL,
    prox_cobro_bloque_extra         TIMESTAMP NOT NULL,
    valor_impuesto                  INTEGER NOT NULL,
    freq_cobro_impuesto_dias        INTEGER NOT NULL,
    prox_cobro_impuesto             TIMESTAMP NOT NULL,
    freq_rotacion_lideres_dias      INTEGER NOT NULL,
    prox_rotacion_lideres           TIMESTAMP NOT NULL
);

CREATE SEQUENCE producto_id_seq;
CREATE TABLE producto (
    id_producto     INTEGER PRIMARY KEY DEFAULT nextval('producto_id_seq'),
    nombre          TEXT NOT NULL,
    bloques_total   INTEGER NOT NULL,
    id_juego        INTEGER NOT NULL,
    vigente         BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER SEQUENCE producto_id_seq OWNED BY producto.id_producto;

CREATE SEQUENCE ciudad_id_seq;
CREATE TABLE ciudad (
    id_ciudad       INTEGER PRIMARY KEY DEFAULT nextval('ciudad_id_seq'),
    nombre_ciudad   TEXT NOT NULL,
    url_imagen      TEXT,
    descripcion     TEXT NOT NULL,
    hora_abre       TIME NOT NULL DEFAULT '09:00:00',
    hora_cierre     TIME NOT NULL DEFAULT '18:00:00',
    id_juego        INTEGER NOT NULL,
    id_profesor     INTEGER NOT NULL,
    vigente         BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER SEQUENCE ciudad_id_seq OWNED BY ciudad.id_ciudad;

CREATE SEQUENCE jugador_id_seq;
CREATE TABLE jugador (
    id_jugador      INTEGER PRIMARY KEY DEFAULT nextval('jugador_id_seq'),,
    id_juego        INTEGER NOT NULL,
    id_alumno       INTEGER NOT NULL,
    id_grupo        INTEGER,
    veces_designado INTEGER NOT NULL DEFAULT 0,
    vigente         BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER SEQUENCE jugador_id_seq OWNED BY jugador.id_jugador;

CREATE SEQUENCE grupo_id_seq;
CREATE TABLE grupo (
    id_grupo              INTEGER PRIMARY KEY DEFAULT nextval('grupo_id_seq'),
    nombre_grupo          TEXT NOT NULL UNIQUE,
    dinero_actual         INTEGER NOT NULL,
    bloques_extra         INTEGER NOT NULL DEFAULT 0,
    id_jugador_designado  INTEGER,
    id_juego              INTEGER NOT NULL,
    vigente               BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER SEQUENCE grupo_id_seq OWNED BY grupo.id_grupo;

CREATE SEQUENCE utilidad_id_seq;
CREATE TABLE utilidad (
    id_utilidad     INTEGER PRIMARY KEY DEFAULT nextval('utilidad_id_seq'),
    id_grupo        INTEGER NOT NULL,
    fecha_semana    TIMESTAMP,
    monto           INTEGER
);
ALTER SEQUENCE utilidad_id_seq OWNED BY utilidad.id_utilidad;

CREATE SEQUENCE prestamo_id_seq;
CREATE TABLE prestamo (
    id_prestamo     INTEGER PRIMARY KEY DEFAULT nextval('prestamo_id_seq'),
    fecha_prestamo  TIMESTAMP NOT NULL,
    cantidad        INTEGER NOT NULL,
    descripcion     TEXT NOT NULL,
    aprobado        BOOLEAN,
    fecha_accion    TIMESTAMP,
    detalle_accion  TEXT,
    id_grupo        INTEGER NOT NULL
);
ALTER SEQUENCE prestamo_id_seq OWNED BY prestamo.id_prestamo;

CREATE TABLE ciudad_producto (
    id_ciudad       INTEGER NOT NULL,
    id_producto     INTEGER NOT NULL,
    stock_actual    INTEGER NOT NULL,
    stock_max       INTEGER NOT NULL,
    precio_max      INTEGER NOT NULL,
    precio_min      INTEGER NOT NULL,
    factor_venta    NUMERIC NOT NULL,
    factor_compra   NUMERIC NOT NULL,
    precio_venta    INTEGER NOT NULL,
    precio_compra   INTEGER NOT NULL,
    PRIMARY KEY (id_ciudad, id_producto)
);

CREATE TABLE stock_producto_grupo (
    id_grupo        INTEGER NOT NULL,
    id_producto     INTEGER NOT NULL,
    stock_camion    INTEGER NOT NULL DEFAULT 0,
    stock_bodega    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id_grupo, id_producto)
);

CREATE SEQUENCE intercambio_id_seq;
CREATE TABLE intercambio (
    id_intercambio      INTEGER PRIMARY KEY DEFAULT nextval('intercambio_id_seq'),
    fecha_intercambio   TIMESTAMP NOT NULL,
    id_ciudad           INTEGER NOT NULL,
    id_grupo            INTEGER NOT NULL
);
ALTER SEQUENCE intercambio_id_seq OWNED BY intercambio.id_intercambio;

CREATE TABLE intercambio_producto (
    id_intercambio  INTEGER NOT NULL,
    id_producto     INTEGER NOT NULL,
    es_compra       BOOLEAN NOT NULL DEFAULT TRUE,
    cantidad        INTEGER NOT NULL,
    precio_compra   INTEGER NOT NULL,
    precio_venta    INTEGER NOT NULL,
    PRIMARY KEY (id_intercambio, id_producto, es_compra)
);

CREATE SEQUENCE comercio_grupos_id_seq;
CREATE TABLE comercio_grupos (
    id_comercio_grupos      INTEGER PRIMARY KEY DEFAULT nextval('comercio_grupos_id_seq'),
    id_grupo_ofertante      INTEGER NOT NULL,
    id_grupo_demandante     INTEGER NOT NULL,
    dinero_grupo_ofertante  INTEGER NOT NULL,
    dinero_grupo_demandante INTEGER NOT NULL
);
ALTER SEQUENCE comercio_grupos_id_seq OWNED BY comercio_grupos.id_comercio_grupos;

CREATE SEQUENCE transaccion_comercio_id_seq;
CREATE TABLE transaccion_comercio (
    id_transaccion_comercio INTEGER PRIMARY KEY DEFAULT nextval('transaccion_comercio_id_seq'),
    id_comercio_grupos      INTEGER NOT NULL,
    id_grupo_ofertante      INTEGER NOT NULL,
    id_producto_ofrecido    INTEGER NOT NULL,
    cantidad                INTEGER NOT NULL
);
ALTER SEQUENCE transaccion_comercio_id_seq OWNED BY transaccion_comercio.id_transaccion_comercio;

CREATE SEQUENCE historial_acciones_id_seq;
CREATE TABLE historial_acciones (
    id_historial    INTEGER PRIMARY KEY DEFAULT nextval('historial_acciones_id_seq'),
    id_usuario      INTEGER NOT NULL,
    accion_momento  TIMESTAMP NOT NULL,
    accion_codigo   INTEGER NOT NULL,
    accion_mensaje  TEXT NOT NULL,
    accion_id       INTEGER
);
ALTER SEQUENCE historial_acciones_id_seq OWNED BY historial_acciones.id_historial;

CREATE SEQUENCE historial_juego_id_seq;
CREATE TABLE historial_juego (
    id_historial    INTEGER PRIMARY KEY DEFAULT nextval('historial_juego_id_seq'),
    id_jugador      INTEGER NOT NULL,
    accion_momento  TIMESTAMP NOT NULL,
    accion_mensaje  TEXT NOT NULL,
    accion_codigo   INTEGER NOT NULL,
    accion_id       INTEGER,
    id_juego        INTEGER NOT NULL
);
ALTER SEQUENCE historial_juego_id_seq OWNED BY historial_juego.id_historial;

ALTER TABLE usuario ADD FOREIGN KEY (id_rol) REFERENCES rol(id_rol);
ALTER TABLE usuario ADD FOREIGN KEY (id_persona) REFERENCES persona(id_persona);
ALTER TABLE alumno ADD FOREIGN KEY (id_alumno) REFERENCES persona(id_persona);
ALTER TABLE alumno ADD FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera);
ALTER TABLE profesor ADD FOREIGN KEY (id_profesor) REFERENCES persona(id_persona);
ALTER TABLE config_juego ADD FOREIGN KEY (id_juego) REFERENCES juego(id_juego);
ALTER TABLE producto ADD FOREIGN KEY (id_juego) REFERENCES juego(id_juego);
ALTER TABLE ciudad ADD FOREIGN KEY (id_juego) REFERENCES juego(id_juego);
ALTER TABLE ciudad ADD FOREIGN KEY (id_profesor) REFERENCES profesor(id_profesor);
ALTER TABLE jugador ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno);
ALTER TABLE jugador ADD FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo);
ALTER TABLE jugador ADD FOREIGN KEY (id_juego) REFERENCES juego(id_juego);
ALTER TABLE grupo ADD FOREIGN KEY (id_jugador_designado) REFERENCES jugador(id_jugador);
ALTER TABLE grupo ADD FOREIGN KEY (id_juego) REFERENCES juego(id_juego);
ALTER TABLE utilidad ADD FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo);
ALTER TABLE prestamo ADD FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo);
ALTER TABLE ciudad_producto ADD FOREIGN KEY (id_ciudad) REFERENCES ciudad(id_ciudad);
ALTER TABLE ciudad_producto ADD FOREIGN KEY (id_producto) REFERENCES producto(id_producto);
ALTER TABLE stock_producto_grupo ADD FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo);
ALTER TABLE stock_producto_grupo ADD FOREIGN KEY (id_producto) REFERENCES producto(id_producto);
ALTER TABLE intercambio ADD FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo);
ALTER TABLE intercambio ADD FOREIGN KEY (id_ciudad) REFERENCES ciudad(id_ciudad);
ALTER TABLE intercambio_producto ADD FOREIGN KEY (id_producto) REFERENCES producto(id_producto);
ALTER TABLE intercambio_producto ADD FOREIGN KEY (id_intercambio) REFERENCES intercambio(id_intercambio);
ALTER TABLE comercio_grupos ADD FOREIGN KEY (id_grupo_ofertante) REFERENCES grupo(id_grupo);
ALTER TABLE comercio_grupos ADD FOREIGN KEY (id_grupo_demandante) REFERENCES grupo(id_grupo);
ALTER TABLE transaccion_comercio ADD FOREIGN KEY (id_grupo_ofertante) REFERENCES grupo(id_grupo);
ALTER TABLE transaccion_comercio ADD FOREIGN KEY (id_producto_ofrecido) REFERENCES producto(id_producto);
ALTER TABLE transaccion_comercio ADD FOREIGN KEY (id_comercio_grupos) REFERENCES comercio_grupos(id_comercio_grupos);
ALTER TABLE historial_acciones ADD FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);
ALTER TABLE historial_juego ADD FOREIGN KEY (id_juego) REFERENCES juego(id_juego);
ALTER TABLE historial_juego ADD FOREIGN KEY (id_jugador) REFERENCES jugador(id_jugador);

/* DATOS DE INICIO */

INSERT INTO carrera (id_carrera, nombre_carrera) VALUES 
    (1,'Ingeniería Civil en Computación e Informática'),
    (2,'Ingeniería Civil Industrial');

INSERT INTO rol (id_rol,nombre_rol) VALUES
    (1,'ADMINISTRADOR'),
    (2,'PROFESOR'),
    (3,'JUGADOR');

INSERT INTO persona (id_persona,rut,nombre,apellido_p,correo_ucn,user_created) VALUES
    (1,'11.111.111-1','Administrador','','admin@ucn.cl',TRUE);

/* Clave Admin: claveprueba */
INSERT INTO usuario (id_usuario,pass_hash,id_persona,id_rol) VALUES 
    (1,'$2a$13$i.fPSwmE3LQs6JlI13tpZOjXI/ZBEuLhoMHYlFLSnx7rOHa7iuJya',1,1);

ALTER SEQUENCE carrera_id_seq RESTART WITH 4;
ALTER SEQUENCE rol_id_seq RESTART WITH 5;
ALTER SEQUENCE persona_id_seq RESTART WITH 2;
ALTER SEQUENCE usuario_id_seq RESTART WITH 2;

/*CREATE USER juego_intro_ingenieria_user 
	WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
	INHERIT NOREPLICATION
	CONNECTION LIMIT -1
	PASSWORD 'BdE(H+MbQeThWmZq4t7w!zrCgF)JgNcR';*/
GRANT CONNECT ON DATABASE juego_intro_ingenieria TO juego_intro_ingenieria_user;
GRANT USAGE ON SCHEMA public TO juego_intro_ingenieria_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO juego_intro_ingenieria_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO juego_intro_ingenieria_user;