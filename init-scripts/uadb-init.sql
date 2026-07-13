-- Fragment UADB
CREATE TABLE IF NOT EXISTS EMPLOYE_UADB (
    id_emp BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(200),
    statut VARCHAR(50),
    bibliotheque VARCHAR(10) DEFAULT 'UADB'
);

CREATE TABLE IF NOT EXISTS ETUDIANT_UADB (
    id_etud BIGINT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(200),
    universite VARCHAR(10) DEFAULT 'UADB',
    specialite VARCHAR(50),
    nbre_emprunts INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS OUVRAGE_UADB (
    id_ouv BIGSERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    auteur_id BIGINT,
    editeur VARCHAR(100),
    annee INTEGER,
    domaine VARCHAR(50),
    stock INTEGER DEFAULT 0,
    site VARCHAR(10) DEFAULT 'UADB'
);

CREATE TABLE IF NOT EXISTS PRET_UADB (
    id_pret BIGSERIAL PRIMARY KEY,
    ouvrage_id BIGINT NOT NULL,
    etudiant_id BIGINT NOT NULL,
    date_emprunt DATE DEFAULT CURRENT_DATE,
    date_retour DATE,
    CONSTRAINT fk_ouvrage FOREIGN KEY (ouvrage_id) REFERENCES OUVRAGE_UADB(id_ouv)
);

-- Insertion avec IDs uniques (3000-3999)
INSERT INTO ETUDIANT_UADB (id_etud, nom, adresse, specialite, nbre_emprunts) VALUES 
(3001, 'Mbaye Ousmane', 'Ziguinchor', 'Informatique', 0),
(3002, 'Diouf Rose', 'Ziguinchor', 'Maths', 0);

INSERT INTO OUVRAGE_UADB (titre, auteur_id, editeur, annee, domaine, stock) VALUES 
('Civilisation ou Barbarie', 4, 'Présence Africaine', 1967, 'Histoire', 3),
('Le Dernier des justes', 2, 'Le Seuil', 1959, 'Littérature', 2);
