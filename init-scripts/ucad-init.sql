-- Fragment UCAD
CREATE TABLE IF NOT EXISTS EMPLOYE_UCAD (
    id_emp BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(200),
    statut VARCHAR(50),
    bibliotheque VARCHAR(10) DEFAULT 'UCAD'
);

CREATE TABLE IF NOT EXISTS ETUDIANT_UCAD (
    id_etud BIGINT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(200),
    universite VARCHAR(10) DEFAULT 'UCAD',
    specialite VARCHAR(50),
    nbre_emprunts INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS OUVRAGE_UCAD (
    id_ouv BIGSERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    auteur_id BIGINT,
    editeur VARCHAR(100),
    annee INTEGER,
    domaine VARCHAR(50),
    stock INTEGER DEFAULT 0,
    site VARCHAR(10) DEFAULT 'UCAD'
);

CREATE TABLE IF NOT EXISTS PRET_UCAD (
    id_pret BIGSERIAL PRIMARY KEY,
    ouvrage_id BIGINT NOT NULL,
    etudiant_id BIGINT NOT NULL,
    date_emprunt DATE DEFAULT CURRENT_DATE,
    date_retour DATE,
    CONSTRAINT fk_ouvrage FOREIGN KEY (ouvrage_id) REFERENCES OUVRAGE_UCAD(id_ouv)
);

-- Insertion avec IDs uniques (2000-2999)
INSERT INTO ETUDIANT_UCAD (id_etud, nom, adresse, specialite, nbre_emprunts) VALUES 
(2001, 'Sow Marième', 'Dakar', 'Médecine', 0),
(2002, 'Gueye El Hadj', 'Thiès', 'Physique', 0);

INSERT INTO OUVRAGE_UCAD (titre, auteur_id, editeur, annee, domaine, stock) VALUES 
('Nations nègres et culture', 4, 'Présence Africaine', 1954, 'Histoire', 4),
('L''Amour, la fantasia', 2, 'Gallimard', 1985, 'Littérature', 2);
