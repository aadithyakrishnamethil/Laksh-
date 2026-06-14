-- Subjects
create table if not exists subjects (
  id text primary key, -- e.g. 'phy', 'chem', 'math'
  name text not null,
  board text not null default 'CBSE',
  class text not null default '12',
  color text not null default '#2A7AFE',
  icon text not null default '📚'
);

-- Chapters
create table if not exists chapters (
  id text primary key, -- e.g. 'phy-1', 'math-3'
  subject_id text not null references subjects(id) on delete cascade,
  name text not null,
  weightage_pct numeric(5,2) not null default 0,
  "order" integer not null default 0
);

-- Seed CBSE Class 12 subjects
insert into subjects (id, name, board, class, color, icon) values
  ('phy',  'Physics',           'CBSE', '12', '#2A7AFE', '⚡'),
  ('chem', 'Chemistry',         'CBSE', '12', '#34C759', '🧪'),
  ('math', 'Mathematics',       'CBSE', '12', '#FF9F0A', '📐'),
  ('bio',  'Biology',           'CBSE', '12', '#FF3B30', '🌱'),
  ('eng',  'English',           'CBSE', '12', '#675178', '📚'),
  ('cs',   'Computer Science',  'CBSE', '12', '#423376', '💻')
on conflict (id) do nothing;

-- Seed Physics chapters
insert into chapters (id, subject_id, name, weightage_pct, "order") values
  ('phy-1',  'phy', 'Electric Charges and Fields',            8,  1),
  ('phy-2',  'phy', 'Electrostatic Potential and Capacitance',7,  2),
  ('phy-3',  'phy', 'Current Electricity',                    7,  3),
  ('phy-4',  'phy', 'Moving Charges and Magnetism',           6,  4),
  ('phy-5',  'phy', 'Magnetism and Matter',                   4,  5),
  ('phy-6',  'phy', 'Electromagnetic Induction',              8,  6),
  ('phy-7',  'phy', 'Alternating Current',                    7,  7),
  ('phy-8',  'phy', 'Electromagnetic Waves',                  3,  8),
  ('phy-9',  'phy', 'Ray Optics and Optical Instruments',     8,  9),
  ('phy-10', 'phy', 'Wave Optics',                            5, 10),
  ('phy-11', 'phy', 'Dual Nature of Radiation and Matter',    4, 11),
  ('phy-12', 'phy', 'Atoms',                                  4, 12),
  ('phy-13', 'phy', 'Nuclei',                                 4, 13),
  ('phy-14', 'phy', 'Semiconductor Electronics',              7, 14),
  ('phy-15', 'phy', 'Communication Systems',                  3, 15)
on conflict (id) do nothing;

-- Seed Chemistry chapters
insert into chapters (id, subject_id, name, weightage_pct, "order") values
  ('chem-1',  'chem', 'The Solid State',                              4,  1),
  ('chem-2',  'chem', 'Solutions',                                     5,  2),
  ('chem-3',  'chem', 'Electrochemistry',                              5,  3),
  ('chem-4',  'chem', 'Chemical Kinetics',                             5,  4),
  ('chem-5',  'chem', 'Surface Chemistry',                             4,  5),
  ('chem-6',  'chem', 'General Principles of Isolation of Elements',   3,  6),
  ('chem-7',  'chem', 'The p-Block Elements',                          8,  7),
  ('chem-8',  'chem', 'The d and f Block Elements',                    5,  8),
  ('chem-9',  'chem', 'Coordination Compounds',                        5,  9),
  ('chem-10', 'chem', 'Haloalkanes and Haloarenes',                    4, 10),
  ('chem-11', 'chem', 'Alcohols, Phenols and Ethers',                  4, 11),
  ('chem-12', 'chem', 'Aldehydes, Ketones and Carboxylic Acids',       6, 12),
  ('chem-13', 'chem', 'Amines',                                         4, 13),
  ('chem-14', 'chem', 'Biomolecules',                                   4, 14),
  ('chem-15', 'chem', 'Polymers',                                       3, 15),
  ('chem-16', 'chem', 'Chemistry in Everyday Life',                     3, 16)
on conflict (id) do nothing;

-- Seed Mathematics chapters
insert into chapters (id, subject_id, name, weightage_pct, "order") values
  ('math-1',  'math', 'Relations and Functions',         8,  1),
  ('math-2',  'math', 'Inverse Trigonometric Functions', 4,  2),
  ('math-3',  'math', 'Matrices',                        5,  3),
  ('math-4',  'math', 'Determinants',                    5,  4),
  ('math-5',  'math', 'Continuity and Differentiability',8,  5),
  ('math-6',  'math', 'Application of Derivatives',      8,  6),
  ('math-7',  'math', 'Integrals',                       8,  7),
  ('math-8',  'math', 'Application of Integrals',        5,  8),
  ('math-9',  'math', 'Differential Equations',          5,  9),
  ('math-10', 'math', 'Vector Algebra',                  5, 10),
  ('math-11', 'math', 'Three Dimensional Geometry',      6, 11),
  ('math-12', 'math', 'Linear Programming',              5, 12),
  ('math-13', 'math', 'Probability',                     8, 13)
on conflict (id) do nothing;

-- Seed Biology chapters
insert into chapters (id, subject_id, name, weightage_pct, "order") values
  ('bio-1',  'bio', 'Reproduction in Organisms',                      4,  1),
  ('bio-2',  'bio', 'Sexual Reproduction in Flowering Plants',         7,  2),
  ('bio-3',  'bio', 'Human Reproduction',                              7,  3),
  ('bio-4',  'bio', 'Reproductive Health',                             5,  4),
  ('bio-5',  'bio', 'Principles of Inheritance and Variation',        10,  5),
  ('bio-6',  'bio', 'Molecular Basis of Inheritance',                  8,  6),
  ('bio-7',  'bio', 'Evolution',                                        4,  7),
  ('bio-8',  'bio', 'Human Health and Disease',                         7,  8),
  ('bio-9',  'bio', 'Strategies for Enhancement in Food Production',   4,  9),
  ('bio-10', 'bio', 'Microbes in Human Welfare',                        4, 10),
  ('bio-11', 'bio', 'Biotechnology: Principles and Processes',         7, 11),
  ('bio-12', 'bio', 'Biotechnology and its Applications',              5, 12),
  ('bio-13', 'bio', 'Organisms and Populations',                        4, 13),
  ('bio-14', 'bio', 'Ecosystem',                                         5, 14),
  ('bio-15', 'bio', 'Biodiversity and Conservation',                    4, 15),
  ('bio-16', 'bio', 'Environmental Issues',                              3, 16)
on conflict (id) do nothing;

-- Seed English chapters
insert into chapters (id, subject_id, name, weightage_pct, "order") values
  ('eng-1', 'eng', 'Flamingo – Prose',          20, 1),
  ('eng-2', 'eng', 'Flamingo – Poetry',         10, 2),
  ('eng-3', 'eng', 'Vistas – Supplementary',    10, 3),
  ('eng-4', 'eng', 'Writing Skills',            30, 4),
  ('eng-5', 'eng', 'Grammar',                   30, 5)
on conflict (id) do nothing;

-- Seed Computer Science chapters
insert into chapters (id, subject_id, name, weightage_pct, "order") values
  ('cs-1', 'cs', 'Python Revision Tour',         10, 1),
  ('cs-2', 'cs', 'Object Oriented Programming',  15, 2),
  ('cs-3', 'cs', 'File Handling',                10, 3),
  ('cs-4', 'cs', 'Data Structures – Stack',       8, 4),
  ('cs-5', 'cs', 'Data Structures – Queue',       8, 5),
  ('cs-6', 'cs', 'Database Concepts and MySQL',  20, 6),
  ('cs-7', 'cs', 'Computer Networks',            15, 7),
  ('cs-8', 'cs', 'Society, Law and Ethics',      14, 8)
on conflict (id) do nothing;
