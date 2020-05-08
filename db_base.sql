/* CREATE DATABASE juego_intro_ingenieria */

CREATE SEQUENCE usuario_id_seq;
CREATE TABLE usuario (
    id_usuario      INTEGER PRIMARY KEY DEFAULT nextval('usuario_id_seq'),
    pass_hash       TEXT NOT NULL,
    id_persona      INTEGER NOT NULL UNIQUE,
    id_rol          INTEGER NOT NULL,
    ultima_ip       TEXT,
    token_s         TEXT,
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
    correo_ucn  TEXT NOT NULL UNIQUE
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
    max_bloques_camion              INTEGER NOT NULL,
    max_bloques_bodega              INTEGER NOT NULL,
    precio_bloque_extra             INTEGER NOT NULL,
    valor_impuesto                  INTEGER NOT NULL,
    veces_compra_ciudad_dia         INTEGER NOT NULL,
    se_puede_comerciar              BOOLEAN NOT NULL DEFAULT FALSE,
    se_puede_comprar_bloques        BOOLEAN NOT NULL DEFAULT TRUE,
    intervalo_rotacion_lideres_dias INTEGER NOT NULL,
    fecha_prox_rotacion_lideres     TIMESTAMP NOT NULL
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
    id_jugador      INTEGER PRIMARY KEY DEFAULT nextval('jugador_id_seq'),
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
    vigente         BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER SEQUENCE grupo_id_seq OWNED BY grupo.id_grupo;

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
ALTER TABLE grupo ADD FOREIGN KEY (id_jugador_designado) REFERENCES jugador(id_jugador);
ALTER TABLE grupo ADD FOREIGN KEY (id_juego) REFERENCES juego(id_juego);
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
    (2,'Ingeniería Civil Industrial'),
    (3,'Ingeniería en Tecnologías de la Información');

INSERT INTO rol (id_rol,nombre_rol) VALUES
    (1,'ADMINISTRADOR'),
    (2,'PROFESOR'),
    (3,'JUGADOR');

INSERT INTO persona (id_persona,rut,nombre,apellido_p,correo_ucn) VALUES
    (1,'11.111.111-1','Administrador','','admin@ucn.cl');

/* Clave Admin: IntroIngI201902CoquimboUCN */
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


-- TEST DATA
INSERT INTO persona (id_persona,rut,nombre,apellido_p,correo_ucn) VALUES 
    (2,'22.222.222-2','Profesor 1','UCN','a@ucn.cl'),
    (3,'33.333.333.3','Profesor 2','UCN','b@ucn.cl'),
    (4,'44.444.444-4','Alumno 1','UCN','c@ucn.cl'),
    (5,'55.555.555-5','Alumno 2','UCN','d@ucn.cl'),
    (6,'77.777.777-7','Alumno 3','UCN','e@ucn.cl');

INSERT INTO usuario (id_usuario, pass_hash, id_persona, id_rol) VALUES 
    (2,'$2a$13$i.fPSwmE3LQs6JlI13tpZOjXI/ZBEuLhoMHYlFLSnx7rOHa7iuJya',2,2),
    (3,'$2a$13$i.fPSwmE3LQs6JlI13tpZOjXI/ZBEuLhoMHYlFLSnx7rOHa7iuJya',3,2),
    (4,'$2a$13$i.fPSwmE3LQs6JlI13tpZOjXI/ZBEuLhoMHYlFLSnx7rOHa7iuJya',4,3),
    (5,'$2a$13$i.fPSwmE3LQs6JlI13tpZOjXI/ZBEuLhoMHYlFLSnx7rOHa7iuJya',5,3),
    (6,'$2a$13$i.fPSwmE3LQs6JlI13tpZOjXI/ZBEuLhoMHYlFLSnx7rOHa7iuJya',6,3);

INSERT INTO profesor (id_profesor) VALUES (2),(3);
INSERT INTO alumno (id_alumno,id_carrera) VALUES (4,1),(5,2),(6,3);

INSERT INTO juego (id_juego,nombre,semestre,concluido,fecha_inicio) VALUES 
    (1,'Juego de Prueba', '1° Semestre 2020', FALSE, '2020-04-12 08:30:00');

INSERT INTO config_juego (id_juego,dinero_inicial,max_bloques_camion,max_bloques_bodega,
    precio_bloque_extra,valor_impuesto,veces_compra_ciudad_dia,se_puede_comerciar,se_puede_comprar_bloques,
    intervalo_rotacion_lideres_dias,fecha_prox_rotacion_lideres) VALUES 
    (1,10000,20,30,20,200,2,FALSE,TRUE,-1,'2020-04-20 08:00:00');

INSERT INTO jugador (id_jugador,id_alumno,id_grupo,veces_designado) VALUES 
    (1,4,NULL,0),
    (2,5,NULL,0),
    (3,6,NULL,0);

INSERT INTO grupo (id_grupo,nombre_grupo,dinero_actual,bloques_extra,id_jugador_designado,id_juego) VALUES
    (1, 'Team101',10000,0,1,1),
    (2, 'Team102',10000,0,3,1);

UPDATE jugador SET id_grupo = 1 WHERE id_jugador = 1;
UPDATE jugador SET id_grupo = 2 WHERE id_jugador = 2;
UPDATE jugador SET id_grupo = 2 WHERE id_jugador = 3;

INSERT INTO producto (id_producto,nombre,bloques_total,id_juego) VALUES 
    (1,'Carne',4,1),
    (2,'Cerveza',1,1),
    (3,'Vino',2,1),
    (4,'Trigo',2,1),
    (5,'Ladrillos',3,1),
    (6,'Herramientas',1,1),
    (7,'Pescado',2,1),
    (8,'Miel',1,1),
    (9,'Madera',2,1);

INSERT INTO ciudad (id_ciudad,nombre_ciudad,descripcion,id_juego,id_profesor) VALUES 
    (1, 'San Andreas', '', 1, 2),
    (2, 'OvaYork', '', 1, 2);/*,
    (3, 'Pascal City', '', 1, 3),
    (4, 'Nova Prospekt', '', 1, 3),
    (5, 'Stormwind', '', 1, 3);*/

INSERT INTO ciudad_producto (id_ciudad,id_producto,stock_actual,stock_max,precio_max,precio_min,factor_compra,factor_venta,precio_compra,precio_venta) VALUES
    (1,1,28,50,150,80,-1.4,0.82,110,90),
    (1,2,116,250,15,5,-0.04,0.91,10,9),
    (1,3,218,120,35,12,-0.19166,0.95,12,11),
    (1,4,30,100,22,8,-0.14,0.85,17,14),
    (1,5,80,150,35,25,-0.06666,0.82,29,23),
    (1,6,94,400,60,35,-0.0625,0.91,54,49),
    (1,7,60,60,115,70,-0.75,0.8,70,56),
    (1,8,121,120,8,3,-0.04166,0.84,3,2),
    (1,9,121,100,15,5,-0.1,0.87,5,4),
    (2,1,25,40,150,100,-1.25000,0.92,118,108),
    (2,2,80,180,10,3,-0.03888,0.91,6,5),
    (2,3,120,200,32,15,-0.08500,0.91,21,19),
    (2,4,10,150,25,10,-0.10000,0.87,24,20),
    (2,5,50,180,45,30,-0.08333,0.89,40,35),
    (2,6,120,320,68,25,-0.13437,0.92,51,46),
    (2,7,80,100,100,80,-0.20000,0.89,84,74),
    (2,8,100,200,10,2,-0.04000,0.89,6,5),
    (2,9,250,220,25,10,-0.06818,0.92,10,9);

INSERT INTO stock_producto_grupo (id_grupo,id_producto) VALUES 
    (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),
    (2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9);