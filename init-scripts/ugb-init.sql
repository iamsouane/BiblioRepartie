-- Fragment UGB
CREATE TABLE IF NOT EXISTS EMPLOYE_UGB (
    id_emp BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(200),
    statut VARCHAR(50),
    bibliotheque VARCHAR(10) DEFAULT 'UGB'
);

CREATE TABLE IF NOT EXISTS ETUDIANT_UGB (
    id_etud BIGINT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(200),
    universite VARCHAR(10) DEFAULT 'UGB',
    specialite VARCHAR(50),
    nbre_emprunts INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS OUVRAGE_UGB (
    id_ouv BIGSERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    auteur_id BIGINT,
    editeur VARCHAR(100),
    annee INTEGER,
    domaine VARCHAR(50),
    stock INTEGER DEFAULT 0,
    site VARCHAR(10) DEFAULT 'UGB'
);

CREATE TABLE IF NOT EXISTS AUTEUR (
    id_aut BIGSERIAL PRIMARY KEY,
    nom_auteur VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS PRET_UGB (
    id_pret BIGSERIAL PRIMARY KEY,
    ouvrage_id BIGINT NOT NULL,
    etudiant_id BIGINT NOT NULL,
    date_emprunt DATE DEFAULT CURRENT_DATE,
    date_retour DATE,
    CONSTRAINT fk_ouvrage FOREIGN KEY (ouvrage_id) REFERENCES OUVRAGE_UGB(id_ouv)
);

-- Insertion avec IDs uniques (1000-1999)
INSERT INTO AUTEUR (nom_auteur) VALUES 
('Victor Hugo'),
('Albert Camus'),
('Mariama Bâ'),
('Cheikh Anta Diop');

INSERT INTO ETUDIANT_UGB (id_etud, nom, adresse, specialite, nbre_emprunts) VALUES 
(1001, 'Diallo Amadou', 'Dakar', 'Informatique', 0),
(1002, 'Ndiaye Fatou', 'Saint-Louis', 'Maths', 0);

INSERT INTO OUVRAGE_UGB (titre, auteur_id, editeur, annee, domaine, stock) VALUES 
('Les Misérables', 1, 'Hachette', 1862, 'Littérature', 5),
('L''Étranger', 2, 'Gallimard', 1942, 'Littérature', 3),
('Une si longue lettre', 3, 'Présence Africaine', 1979, 'Littérature', 2);

INSERT INTO EMPLOYE_UGB (nom, adresse, statut) VALUES 
('Diop Mamadou', 'Saint-Louis', 'Bibliothécaire'),
('Fall Awa', 'Saint-Louis', 'Assistant');
