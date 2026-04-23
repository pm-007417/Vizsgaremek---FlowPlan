-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2026 at 03:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `flowplan`
--

CREATE DATABASE IF NOT EXISTS `flowplan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `flowplan`;

-- --------------------------------------------------------

--
-- Table structure for table `feladatok`
--

CREATE TABLE `feladatok` (
  `id` int(11) NOT NULL,
  `cim` varchar(255) NOT NULL,
  `leiras` text DEFAULT NULL,
  `hatarido` date DEFAULT NULL,
  `allapot` enum('uj','folyamatban','felfuggesztve','kesz','torolve','archivalt') DEFAULT 'uj',
  `letrehozas_datum` date DEFAULT curdate(),
  `tulajdonos_id` int(11) DEFAULT NULL,
  `tarsasag_id` int(11) DEFAULT NULL,
  `projekt_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `feladatok`
--

INSERT INTO `feladatok` (`id`, `cim`, `leiras`, `hatarido`, `allapot`, `letrehozas_datum`, `tulajdonos_id`, `tarsasag_id`, `projekt_id`) VALUES
(1, 'Oldalváz készítés', 'Az oldal fő szerkezetének kialakítása.', '2026-03-15', 'kesz', '2026-01-12', 2, 1, 1),
(2, 'Design alapok', 'Alap vizuális elemek beállítása.', '2026-04-01', 'folyamatban', '2026-01-18', 1, 1, 1),
(3, 'Tartalom feltöltés', 'Teszt tartalmak rögzítése.', '2026-05-15', 'uj', '2026-02-01', 3, 1, 1),
(4, 'Kampány terv', 'Kampány célok és irány meghatározása.', '2026-03-01', 'kesz', '2026-02-10', 1, 1, 2),
(5, 'Hirdetés beállítás', 'Hirdetések konfigurálása.', '2026-04-15', 'folyamatban', '2026-02-15', 2, 1, 2),
(6, 'Eredmények követése', 'Kampány teljesítmény figyelése.', '2026-05-15', 'uj', '2026-02-20', 3, 1, 2),
(7, 'Struktúra kialakítás', 'Dokumentáció felépítésének megtervezése.', '2026-04-15', 'kesz', '2026-02-05', 2, 1, 9),
(8, 'Cikkek létrehozása', 'Alap ismertetők elkészítése.', '2026-06-30', 'folyamatban', '2026-02-10', 1, 1, 9),
(9, 'Adatmodell tervezés', 'Adatbázis struktúra kialakítása.', '2026-03-01', 'kesz', '2026-01-22', 2, 2, 4),
(10, 'Adatbázis', 'Adatbázis létrehozása, feltöltése adatokkal.', '2026-04-01', 'folyamatban', '2026-01-28', 1, 2, 4),
(11, 'API fejlesztés', 'Backend funkciók implementálása.', '2026-05-31', 'folyamatban', '2026-02-03', 3, 2, 4),
(12, 'Tesztelés', 'Backend működés ellenőrzése.', '2026-06-30', 'uj', '2026-02-10', 6, 2, 4),
(13, 'Struktúra kialakítás', 'Dokumentáció felépítésének meghatározása.', '2026-02-26', 'kesz', '2026-01-22', 1, 2, 3),
(14, 'Tartalom írás', 'Leírások elkészítése.', '2026-03-31', 'kesz', '2026-02-01', 6, 2, 3),
(15, 'Frissítés', 'Dokumentáció karbantartása.', '2026-04-30', 'kesz', '2026-02-06', 2, 2, 3),
(16, 'UI kialakítás', 'Felhasználói felület alapjainak elkészítése.', '2026-04-30', 'kesz', '2026-02-08', 2, 2, 10),
(17, 'Oldalak fejlesztése', 'Fő nézetek implementálása.', '2026-06-30', 'folyamatban', '2026-02-12', 1, 2, 10),
(18, 'Integráció', 'Backend kapcsolatok beállítása.', '2026-08-31', 'uj', '2026-02-20', 3, 2, 10),
(19, 'UX élmény javítás', 'UX finomítás, esetleges logikai hibák javítása.', '2026-09-30', 'uj', '2026-03-01', 6, 2, 10),
(20, 'Logó készítés', 'Logó alap verzió elkészítése.', '2026-03-01', 'kesz', '2026-01-25', 6, 3, 5),
(21, 'Színek meghatározása', 'Színpaletta kialakítása.', '2026-03-15', 'kesz', '2026-01-22', 5, 3, 5),
(22, 'Betűtípusok', 'Használt fontok kiválasztása.', '2026-03-10', 'kesz', '2026-01-22', 1, 3, 5),
(23, 'Feltöltés funkció', 'Képfeltöltési lehetőség kialakítása.', '2026-05-31', 'kesz', '2026-02-12', 5, 3, 11),
(24, 'Lista nézet', 'Képek megjelenítése listában.', '2026-07-31', 'folyamatban', '2026-02-15', 6, 3, 11),
(25, 'Törlés funkció', 'Képek eltávolításának biztosítása.', '2026-09-30', 'archivalt', '2026-02-20', 6, 3, 11),
(26, 'Időpontok egyeztetése', 'Edzések időpontjainak meghatározása.', '2026-03-15', 'kesz', '2026-01-27', 4, 4, 7),
(27, 'Edzés terv készítés', 'Edzésmenet összeállítása.', '2026-04-30', 'folyamatban', '2026-02-01', 7, 4, 7),
(28, 'Helyszín biztosítás', 'Edzés helyszínének lefoglalása.', '2026-03-31', 'kesz', '2026-02-05', 8, 4, 7),
(29, 'Jelentkezések kezelése', 'Résztvevők regisztrációjának kezelése.', '2026-02-28', 'folyamatban', '2026-02-01', 4, 4, 6),
(30, 'Program összeállítás', 'Verseny menetrend kialakítása.', '2026-02-15', 'kesz', '2026-01-22', 7, 4, 6),
(31, 'Eredmények rögzítése', 'Versenyeredmények dokumentálása.', '2026-03-30', 'uj', '2026-02-10', 8, 4, 6),
(32, 'Tagok rögzítése', 'Új tagok adatainak felvétele.', '2026-04-30', 'folyamatban', '2026-02-01', 4, 4, 8),
(33, 'Adatok frissítése', 'Tagadatok karbantartása.', '2026-06-15', 'felfuggesztve', '2026-02-05', 7, 4, 8),
(34, 'Játékok kiválasztása', 'Játszandó játékok meghatározása.', '2026-03-15', 'kesz', '2026-02-12', 4, 5, 12),
(35, 'Időpont egyeztetés', 'Esemény időpontjának kijelölése.', '2026-03-20', 'kesz', '2026-02-15', 5, 5, 12),
(36, 'Résztvevők kezelése', 'Jelentkezők nyilvántartása.', '2026-05-01', 'folyamatban', '2026-02-20', 6, 5, 12),
(37, 'Könyv kiválasztása', 'Feldolgozandó könyv kijelölése.', '2026-03-31', 'kesz', '2026-02-22', 4, 5, 13),
(38, 'Találkozó szervezés', 'Klubesemény lebonyolítása.', '2026-07-15', 'folyamatban', '2026-02-25', 5, 5, 13),
(39, 'Forgatókönyv', 'Történet és jelenetek kidolgozása.', '2026-04-30', 'kesz', '2026-03-12', 1, 6, 14),
(40, 'Forgatás', 'Jelenetek rögzítése.', '2026-06-30', 'felfuggesztve', '2026-03-15', 8, 6, 14),
(41, 'Vágás', 'Nyersanyag szerkesztése.', '2026-07-31', 'felfuggesztve', '2026-03-20', 7, 6, 14),
(42, 'Hang utómunka', 'Hang javítása és keverése.', '2026-08-20', 'uj', '2026-03-25', 6, 6, 14),
(43, 'Kutatás', 'Téma feltérképezése.', '2026-04-30', 'kesz', '2026-04-13', 3, 6, 18),
(44, 'Interjúk készítése', 'Interjúk rögzítése.', '2026-06-30', 'folyamatban', '2026-04-15', 6, 6, 18),
(45, 'Vágás', 'Anyag összeállítása.', '2026-10-31', 'uj', '2026-04-16', 7, 6, 18),
(46, 'Brief egyeztetés', 'Megrendelői igények tisztázása.', '2026-03-31', 'kesz', '2026-03-26', 1, 6, 15),
(47, 'Forgatás', 'Reklámanyag rögzítése.', '2026-04-20', 'folyamatban', '2026-04-01', 3, 6, 15),
(48, 'Átadás', 'Végleges anyag átadása.', '2026-05-01', 'uj', '2026-04-10', 8, 6, 15),
(49, 'Nyersanyag rendezés', 'Fájlok rendszerezése.', '2026-04-20', 'kesz', '2026-04-14', 3, 6, 19),
(50, 'Vágás', 'Videó összeállítása.', '2026-05-01', 'folyamatban', '2026-04-15', 6, 6, 19),
(51, 'Színezés', 'Képi világ finomítása.', '2026-05-10', 'uj', '2026-04-15', 1, 6, 19),
(52, 'Hangkeverés', 'Hang véglegesítése.', '2026-05-20', 'uj', '2026-04-16', 8, 6, 19),
(53, 'Casting kiírás', 'Jelentkezők toborzása.', '2026-04-30', 'folyamatban', '2026-04-03', 1, 6, 16),
(54, 'Válogatás', 'Szereplők kiválasztása.', '2026-06-30', 'folyamatban', '2026-04-06', 3, 6, 16),
(55, 'Előkészítés', 'Forgatás előkészítése.', '2026-09-01', 'uj', '2026-04-10', 7, 6, 16),
(56, 'Platform kiválasztás', 'Megjelenési felületek kijelölése.', '2026-04-20', 'folyamatban', '2026-04-11', 1, 6, 17),
(57, 'Feltöltés', 'Tartalom publikálása.', '2026-04-25', 'uj', '2026-04-12', 3, 6, 17),
(58, 'Promóció', 'Megjelenés támogatása.', '2026-04-30', 'uj', '2026-04-13', 7, 6, 17);

-- --------------------------------------------------------

--
-- Table structure for table `feladat_reszvetel`
--

CREATE TABLE `feladat_reszvetel` (
  `id` int(11) NOT NULL,
  `hozzadas_datum` date DEFAULT curdate(),
  `felhasznalo_id` int(11) NOT NULL,
  `feladat_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `feladat_reszvetel`
--

INSERT INTO `feladat_reszvetel` (`id`, `hozzadas_datum`, `felhasznalo_id`, `feladat_id`) VALUES
(1, '2026-01-12', 1, 1),
(2, '2026-01-12', 2, 1),
(3, '2026-01-12', 3, 1),
(4, '2026-01-18', 1, 2),
(5, '2026-01-18', 2, 2),
(6, '2026-02-01', 3, 3),
(7, '2026-02-01', 1, 3),
(8, '2026-02-10', 1, 4),
(9, '2026-02-10', 2, 4),
(10, '2026-02-10', 3, 4),
(11, '2026-02-15', 2, 5),
(12, '2026-02-15', 1, 5),
(13, '2026-02-20', 3, 6),
(14, '2026-02-20', 2, 6),
(15, '2026-02-05', 2, 7),
(16, '2026-02-05', 1, 7),
(17, '2026-02-10', 1, 8),
(18, '2026-02-10', 2, 8),
(19, '2026-02-10', 3, 8),
(20, '2026-01-22', 2, 9),
(21, '2026-01-22', 3, 9),
(22, '2026-01-28', 1, 10),
(23, '2026-01-28', 3, 10),
(24, '2026-01-28', 6, 10),
(25, '2026-02-03', 3, 11),
(26, '2026-02-03', 1, 11),
(27, '2026-02-03', 7, 11),
(28, '2026-02-10', 6, 12),
(29, '2026-02-10', 3, 12),
(30, '2026-01-22', 1, 13),
(31, '2026-01-22', 3, 13),
(32, '2026-02-01', 6, 14),
(33, '2026-02-01', 2, 14),
(34, '2026-02-06', 2, 15),
(35, '2026-02-06', 7, 15),
(36, '2026-02-08', 2, 16),
(37, '2026-02-08', 3, 16),
(38, '2026-02-12', 1, 17),
(39, '2026-02-12', 3, 17),
(40, '2026-02-12', 7, 17),
(41, '2026-02-20', 3, 18),
(42, '2026-02-20', 6, 18),
(43, '2026-03-01', 6, 19),
(44, '2026-03-01', 1, 19),
(45, '2026-01-25', 6, 20),
(46, '2026-01-25', 5, 20),
(47, '2026-01-22', 5, 21),
(48, '2026-01-22', 6, 21),
(49, '2026-01-22', 1, 22),
(50, '2026-01-22', 5, 22),
(51, '2026-02-12', 5, 23),
(52, '2026-02-12', 6, 23),
(53, '2026-02-15', 6, 24),
(54, '2026-02-15', 3, 24),
(55, '2026-02-20', 6, 25),
(56, '2026-02-20', 5, 25),
(57, '2026-01-27', 4, 26),
(58, '2026-01-27', 7, 26),
(59, '2026-02-01', 7, 27),
(60, '2026-02-01', 4, 27),
(61, '2026-02-01', 8, 27),
(62, '2026-02-05', 8, 28),
(63, '2026-02-05', 4, 28),
(64, '2026-02-01', 4, 29),
(65, '2026-02-01', 7, 29),
(66, '2026-02-01', 8, 29),
(67, '2026-01-22', 7, 30),
(68, '2026-01-22', 4, 30),
(69, '2026-02-10', 8, 31),
(70, '2026-02-10', 7, 31),
(71, '2026-02-01', 4, 32),
(72, '2026-02-01', 8, 32),
(73, '2026-02-05', 7, 33),
(74, '2026-02-05', 4, 33),
(75, '2026-02-12', 4, 34),
(76, '2026-02-12', 5, 34),
(77, '2026-02-12', 6, 34),
(78, '2026-02-15', 5, 35),
(79, '2026-02-15', 4, 35),
(80, '2026-02-20', 6, 36),
(81, '2026-02-20', 3, 36),
(82, '2026-02-22', 4, 37),
(83, '2026-02-22', 5, 37),
(84, '2026-02-25', 5, 38),
(85, '2026-02-25', 6, 38),
(86, '2026-02-25', 4, 38),
(87, '2026-03-12', 1, 39),
(88, '2026-03-12', 3, 39),
(89, '2026-03-12', 6, 39),
(90, '2026-03-15', 8, 40),
(91, '2026-03-15', 7, 40),
(92, '2026-03-15', 3, 40),
(93, '2026-03-20', 7, 41),
(94, '2026-03-20', 6, 41),
(95, '2026-03-25', 6, 42),
(96, '2026-03-25', 8, 42),
(97, '2026-04-13', 3, 43),
(98, '2026-04-13', 1, 43),
(99, '2026-04-15', 6, 44),
(100, '2026-04-15', 3, 44),
(101, '2026-04-16', 7, 45),
(102, '2026-04-16', 6, 45),
(103, '2026-03-26', 1, 46),
(104, '2026-03-26', 3, 46),
(105, '2026-04-01', 3, 47),
(106, '2026-04-01', 8, 47),
(107, '2026-04-01', 1, 47),
(108, '2026-04-10', 8, 48),
(109, '2026-04-10', 3, 48),
(110, '2026-04-14', 3, 49),
(111, '2026-04-14', 6, 49),
(112, '2026-04-15', 6, 50),
(113, '2026-04-15', 1, 50),
(114, '2026-04-15', 1, 51),
(115, '2026-04-15', 3, 51),
(116, '2026-04-16', 8, 52),
(117, '2026-04-16', 6, 52),
(118, '2026-04-03', 1, 53),
(119, '2026-04-03', 3, 53),
(120, '2026-04-06', 3, 54),
(121, '2026-04-06', 1, 54),
(122, '2026-04-06', 7, 54),
(123, '2026-04-10', 7, 55),
(124, '2026-04-10', 8, 55),
(125, '2026-04-11', 1, 56),
(126, '2026-04-11', 3, 56),
(127, '2026-04-12', 3, 57),
(128, '2026-04-12', 6, 57),
(129, '2026-04-13', 7, 58),
(130, '2026-04-13', 1, 58);

-- --------------------------------------------------------

--
-- Table structure for table `feladat_uzenet`
--

CREATE TABLE `feladat_uzenet` (
  `id` int(11) NOT NULL,
  `letrehozas_datum` timestamp NOT NULL DEFAULT current_timestamp(),
  `tartalom` text NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `feladat_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `feladat_uzenet`
--

INSERT INTO `feladat_uzenet` (`id`, `letrehozas_datum`, `tartalom`, `felhasznalo_id`, `feladat_id`) VALUES
(1, '2026-01-20 00:00:00', 'Oldal struktúra elkészült.', 1, 1),
(2, '2026-02-01 00:00:00', 'Header és footer szekció véglegesítve.', 2, 1),
(3, '2026-02-10 00:00:00', 'Design első verzió jóváhagyva.', 2, 2),
(4, '2026-02-20 00:00:00', 'Színséma és tipográfia rögzítve.', 1, 2),
(5, '2026-03-01 00:00:00', 'Tartalom feltöltés folyamatban.', 3, 3),
(6, '2026-03-15 00:00:00', 'Hiányzó képek pótlása szükséges.', 1, 3),
(7, '2026-02-20 00:00:00', 'Kampány irány elfogadva.', 1, 4),
(8, '2026-02-28 00:00:00', 'Célcsoport definíció véglegesítve.', 2, 4),
(9, '2026-03-01 00:00:00', 'Hirdetési fiók konfigurálása hátra van.', 2, 5),
(10, '2026-03-10 00:00:00', 'Facebook kampány előkészítve, jóváhagyásra vár.', 1, 5),
(11, '2026-03-20 00:00:00', 'Analytics dashboard beállítva.', 3, 6),
(12, '2026-02-15 00:00:00', 'Dokumentáció struktúra kész.', 1, 7),
(13, '2026-02-20 00:00:00', 'Kategória rendszer véglegesítve.', 2, 7),
(14, '2026-02-20 00:00:00', 'Első cikk publikálva.', 2, 8),
(15, '2026-03-01 00:00:00', 'Három alap ismertető feltöltve.', 1, 8),
(16, '2026-02-05 00:00:00', 'ER diagram elkészült.', 2, 9),
(17, '2026-02-10 00:00:00', 'Relációk felülvizsgálva, véglegesítve.', 3, 9),
(18, '2026-02-15 00:00:00', 'Migráció félkész állapotban.', 1, 10),
(19, '2026-03-01 00:00:00', 'Seed adatok feltöltve, tesztelésre kész.', 3, 10),
(20, '2026-02-15 00:00:00', 'Fő endpointok implementálva.', 3, 11),
(21, '2026-03-05 00:00:00', 'Autentikáció és jogosultságkezelés kész.', 1, 11),
(22, '2026-02-25 00:00:00', 'Tesztek futnak, hibák javítása folyamatban.', 6, 12),
(23, '2026-03-10 00:00:00', 'Kritikus hibák javítva, regresszió OK.', 3, 12),
(24, '2026-02-10 00:00:00', 'Dokumentáció struktúra meghatározva.', 1, 13),
(25, '2026-03-01 00:00:00', 'Dokumentáció írás megkezdve.', 6, 14),
(26, '2026-03-20 00:00:00', 'Fő fejezetek elkészültek.', 2, 14),
(27, '2026-02-20 00:00:00', 'Dokumentáció frissítve.', 2, 15),
(28, '2026-02-20 00:00:00', 'UI wireframe elkészült.', 2, 16),
(29, '2026-03-01 00:00:00', 'Komponenskönyvtár alap struktúra kész.', 3, 16),
(30, '2026-02-25 00:00:00', 'Fő oldalak elkészültek.', 1, 17),
(31, '2026-03-15 00:00:00', 'Reszponzív nézetek implementálva.', 3, 17),
(32, '2026-03-05 00:00:00', 'API kapcsolat működik.', 3, 18),
(33, '2026-03-15 00:00:00', 'Felhasználói visszajelzések beérkeztek.', 6, 19),
(34, '2026-04-01 00:00:00', 'Navigáció és folyamatok finomítva.', 1, 19),
(35, '2026-02-10 00:00:00', 'Logó első verzió elkészült.', 6, 20),
(36, '2026-02-20 00:00:00', 'Ügyféljóváhagyás megérkezett.', 5, 20),
(37, '2026-02-05 00:00:00', 'Elsődleges és másodlagos színek kiválasztva.', 5, 21),
(38, '2026-02-15 00:00:00', 'Kontraszt arányok ellenőrizve, OK.', 6, 21),
(39, '2026-01-30 00:00:00', 'Betűtípus kiválasztva.', 1, 22),
(40, '2026-02-05 00:00:00', 'Web font licenszek rendben.', 5, 22),
(41, '2026-02-20 00:00:00', 'Upload működik.', 5, 23),
(42, '2026-03-01 00:00:00', 'Fájlméret-limit és típusellenőrzés kész.', 6, 23),
(43, '2026-02-28 00:00:00', 'Lista nézet kész.', 6, 24),
(44, '2026-03-10 00:00:00', 'Rendezés és szűrés funkció hozzáadva.', 3, 24),
(45, '2026-03-01 00:00:00', 'Törlés funkció archiválva.', 6, 25),
(46, '2026-02-05 00:00:00', 'Időpontok véglegesítve.', 4, 26),
(47, '2026-02-10 00:00:00', 'Edzők és helyszín visszaigazolva.', 7, 26),
(48, '2026-02-15 00:00:00', 'Edzés terv készül.', 7, 27),
(49, '2026-03-01 00:00:00', 'Heti bontás és intenzitási szintek rögzítve.', 4, 27),
(50, '2026-02-20 00:00:00', 'Helyszín lefoglalva.', 8, 28),
(51, '2026-03-01 00:00:00', 'Jelentkezések megnyitva.', 4, 29),
(52, '2026-03-15 00:00:00', '18 regisztrált résztvevő, lista lezárva.', 7, 29),
(53, '2026-02-10 00:00:00', 'Program elkészült.', 7, 30),
(54, '2026-02-20 00:00:00', 'Versenyszámok véglegesítve.', 4, 30),
(55, '2026-03-20 00:00:00', 'Eredménylap sablon elkészítve.', 8, 31),
(56, '2026-03-01 00:00:00', 'Új tagok felvéve.', 4, 32),
(57, '2026-03-20 00:00:00', 'Belépési díjak dokumentálva.', 8, 32),
(58, '2026-02-15 00:00:00', 'Adatok frissítve.', 7, 33),
(59, '2026-03-01 00:00:00', 'Játéklista összeállítva.', 4, 34),
(60, '2026-03-10 00:00:00', 'Szavazás alapján top 5 játék kijelölve.', 5, 34),
(61, '2026-03-10 00:00:00', 'Időpont véglegesítve.', 5, 35),
(62, '2026-03-20 00:00:00', 'Résztvevők száma növekszik.', 6, 36),
(63, '2026-04-01 00:00:00', 'Visszaigazolók listája lezárva.', 3, 36),
(64, '2026-03-05 00:00:00', 'Könyv kiválasztva.', 4, 37),
(65, '2026-03-15 00:00:00', 'Digitális és fizikai példányok elérhetők.', 5, 37),
(66, '2026-03-10 00:00:00', 'Találkozó időpont rögzítve.', 5, 38),
(67, '2026-04-05 00:00:00', 'Agenda és olvasási kérdések előkészítve.', 6, 38),
(68, '2026-03-20 00:00:00', 'Forgatókönyv kész.', 1, 39),
(69, '2026-04-01 00:00:00', 'Producer jóváhagyta, jelenetbontás elkezdve.', 3, 39),
(70, '2026-03-25 00:00:00', 'Forgatás törölve időjárás miatt.', 8, 40),
(71, '2026-04-10 00:00:00', 'Pótforgatás új dátumra ütemezve.', 7, 40),
(72, '2026-04-01 00:00:00', 'Vágás szünetel.', 7, 41),
(73, '2026-04-15 00:00:00', 'Nyers összevágás elkészült, review folyamatban.', 6, 41),
(74, '2026-04-10 00:00:00', 'Zenei aláfestés kiválasztva.', 6, 42),
(75, '2026-04-18 00:00:00', 'Kutatás lezárva.', 3, 43),
(76, '2026-04-18 00:00:00', 'Interjúk folyamatban.', 6, 44),
(77, '2026-04-18 00:00:00', 'Első 3 interjú rögzítve és lementve.', 3, 44),
(78, '2026-04-18 00:00:00', 'Vágás tervezés megkezdve.', 7, 45),
(79, '2026-04-01 00:00:00', 'Brief jóváhagyva.', 1, 46),
(80, '2026-04-10 00:00:00', 'Forgatás zajlik.', 3, 47),
(81, '2026-04-15 00:00:00', 'Összes jelenet leforgatva, rushes rendben.', 8, 47),
(82, '2026-04-18 00:00:00', 'Végleges fájlok előkészítve átadáshoz.', 8, 48),
(83, '2026-04-18 00:00:00', 'Fájlok rendszerezve.', 3, 49),
(84, '2026-04-18 00:00:00', 'Vágás folyamatban.', 6, 50),
(85, '2026-04-18 00:00:00', 'Első rough cut megosztva belső reviewra.', 1, 50),
(86, '2026-04-18 00:00:00', 'Alapszínezés megkezdve.', 1, 51),
(87, '2026-04-18 00:00:00', 'Hanganyagok importálva, keverés elkezdve.', 8, 52),
(88, '2026-04-10 00:00:00', 'Casting meghirdetve.', 1, 53),
(89, '2026-04-15 00:00:00', '42 jelentkező érkezett, előszűrés folyamatban.', 3, 53),
(90, '2026-04-15 00:00:00', 'Első kör lezárva.', 3, 54),
(91, '2026-04-18 00:00:00', '8 jelölt meghívva második körre.', 7, 54),
(92, '2026-04-18 00:00:00', 'Forgatási helyszínek felmérve.', 7, 55),
(93, '2026-04-15 00:00:00', 'Platformok listázva.', 1, 56),
(94, '2026-04-18 00:00:00', 'Vimeo és YouTube prioritásként meghatározva.', 3, 56),
(95, '2026-04-18 00:00:00', 'Metaadatok előkészítve, feltöltés ütemezve.', 3, 57),
(96, '2026-04-18 00:00:00', 'Promóciós terv készül.', 7, 58),
(97, '2026-04-18 00:00:00', 'Social media posztok és press release tervezet kész.', 1, 58);

-- --------------------------------------------------------

--
-- Table structure for table `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL,
  `nev` varchar(255) NOT NULL,
  `jelszo` varchar(255) NOT NULL,
  `email` varchar(50) NOT NULL,
  `letrehozas_datum` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `felhasznalok`
--

INSERT INTO `felhasznalok` (`id`, `nev`, `jelszo`, `email`, `letrehozas_datum`) VALUES
(1, 'Teszt Elek', '$2b$10$BPUuaZk4AnPootJPODvAAeQqICAJSlA3pMyOwJRBRmQmlJqlo1Iwy', 'teszt.elek@test.hu', '2026-01-05'),
(2, 'Gipsz Jakab', '$2a$10$ZefX1tV0gMSILPhTEuvQTu7MkWMOMlI3yktm72iesP.Jfbz1f9.B2', 'gipsz.jakab@test.hu', '2026-01-06'),
(3, 'Giz Ella', '$2b$10$UfWyXzCd1gnObPIQYP9z1uhngqkjlsobqz1qkMU02ugM75ZsJQ7v.', 'giz.ella@test.hu', '2026-01-06'),
(4, 'Bír Tamás', '$2b$10$3qywTAM3OjJO0g.cKoLSL.IjgibjYAUEthBs.IkTvgtRvgmJ9MhFS', 'bir.tamas@test.hu', '2026-01-11'),
(5, 'Vak Béla', '$2b$10$SlpdnAIH9hgqhRum/h9JTebFiTjQcLM/ZBgNOS9zB7JMDSy/AwWo6', 'vak.bela@test.hu', '2026-01-11'),
(6, 'Kor Réka', '$2a$10$ZtpUf41yhlZ9k2LTxNfqieIYpAJD.mdPgJmQRW5/sPcqsVelECY1K', 'kor.reka@test.hu', '2026-01-13'),
(7, 'Fog Nóra', '$2b$10$yEFjLgjsXyiNSNI8M4lyUuVIfilah/Kjc2sd2qqZ3V5NNQlcSL.p6', 'fog.nora@test.hu', '2026-01-13'),
(8, 'Sár Zoltán', '$2b$10$XAKBBFLcs5qC3OoKX0TLK.XRWEHKfXrQHnDfrJKgzb0L9gxFLBIDS', 'sar.zoltan@test.hu', '2026-01-14');

-- --------------------------------------------------------

--
-- Table structure for table `projektek`
--

CREATE TABLE `projektek` (
  `id` int(11) NOT NULL,
  `cim` varchar(255) NOT NULL,
  `leiras` text DEFAULT NULL,
  `hatarido` date DEFAULT NULL,
  `allapot` enum('uj','folyamatban','felfuggesztve','kesz','torolve','archivalt') DEFAULT 'uj',
  `letrehozas_datum` date DEFAULT curdate(),
  `tulajdonos_id` int(11) DEFAULT NULL,
  `tarsasag_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `projektek`
--

INSERT INTO `projektek` (`id`, `cim`, `leiras`, `hatarido`, `allapot`, `letrehozas_datum`, `tulajdonos_id`, `tarsasag_id`) VALUES
(1, 'Teszt oldal', 'Kezdőoldal teszt verzió.', '2026-06-28', 'archivalt', '2026-01-10', 1, 1),
(2, 'Indulási kampány', 'Egyszerű kampány amit induláskor alkalmazunk.', '2026-05-15', 'folyamatban', '2026-01-15', 1, 1),
(3, 'Dokumentáció', 'Dokumentáció elkészítése', '2026-04-30', 'kesz', '2026-01-18', 1, 2),
(4, 'Backend', 'Backend kódolása', '2026-07-31', 'folyamatban', '2026-01-20', 1, 2),
(5, 'Arculat alap', 'Alap vizuális elemek.', '2026-06-30', 'folyamatban', '2026-01-20', 3, 3),
(6, 'Tavaszi verseny szervezés', 'Első verseny lebonyolítása.', '2026-03-30', 'uj', '2026-01-20', 4, 4),
(7, 'Edzés program', 'Heti edzések ütemezése.', '2026-08-15', 'folyamatban', '2026-01-25', 4, 4),
(8, 'Tag nyilvántartás', 'Tagok adatainak kezelése.', '2026-06-15', 'felfuggesztve', '2026-01-28', 7, 4),
(9, 'Tudásbázis alap', 'Alap dokumentációk/ismertetők létrehozása.', '2026-08-31', 'uj', '2026-02-01', 2, 1),
(10, 'Frontend', 'Frontend kódolása', '2026-09-29', 'folyamatban', '2026-02-05', 2, 2),
(11, 'Képkezelő modul', 'Képek kezelése és tárolása.', '2026-10-30', 'folyamatban', '2026-02-10', 5, 3),
(12, 'Társas est', 'Társasjáték alkalom szervezése.', '2026-05-01', 'folyamatban', '2026-02-10', 5, 5),
(13, 'Olvasó kör', 'Könyvklub találkozó lebonyolítása.', '2026-07-15', 'uj', '2026-02-20', 5, 5),
(14, 'Rövidfilm gyártás', 'Egy teljes rövidfilm elkészítése az előkészítéstől a premierig.', '2026-08-20', 'torolve', '2026-03-10', 1, 6),
(15, 'Reklámfilm produkció', 'Marketing célú videó gyártása.', '2026-05-01', 'folyamatban', '2026-03-25', 3, 6),
(16, 'Casting és előkészítés nagyfilmhez', 'Szereplőválogatás és forgatás előkészítése.', '2026-09-01', 'uj', '2026-04-02', 3, 6),
(17, 'Film terjesztés', 'Kész filmek publikálása és terjesztése.', '2026-04-30', 'felfuggesztve', '2026-04-10', 3, 6),
(18, 'Dokumentumfilm készítés', 'Dokumentumfilm projekt teljes lebonyolítása.', '2027-01-31', 'archivalt', '2026-04-12', 3, 6),
(19, 'Utómunka folyamat', 'Vágás, hang és vizuális utómunka kezelése.', '2026-05-19', 'archivalt', '2026-04-13', 1, 6);

-- --------------------------------------------------------

--
-- Table structure for table `projekt_reszvetel`
--

CREATE TABLE `projekt_reszvetel` (
  `id` int(11) NOT NULL,
  `hozzadas_datum` date DEFAULT curdate(),
  `felhasznalo_id` int(11) NOT NULL,
  `projekt_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `projekt_reszvetel`
--

INSERT INTO `projekt_reszvetel` (`id`, `hozzadas_datum`, `felhasznalo_id`, `projekt_id`) VALUES
(1, '2026-01-10', 1, 1),
(2, '2026-01-10', 2, 1),
(3, '2026-01-10', 3, 1),
(4, '2026-01-15', 1, 2),
(5, '2026-01-15', 2, 2),
(7, '2026-02-01', 2, 9),
(8, '2026-02-01', 1, 9),
(9, '2026-02-01', 3, 9),
(10, '2026-01-18', 1, 3),
(11, '2026-01-18', 3, 3),
(12, '2026-01-18', 6, 3),
(13, '2026-01-18', 7, 3),
(14, '2026-01-20', 1, 4),
(15, '2026-01-20', 3, 4),
(16, '2026-01-20', 6, 4),
(17, '2026-01-20', 7, 4),
(18, '2026-02-05', 2, 10),
(19, '2026-02-05', 3, 10),
(20, '2026-02-05', 6, 10),
(21, '2026-02-05', 7, 10),
(22, '2026-01-20', 3, 5),
(23, '2026-01-20', 1, 5),
(24, '2026-01-20', 5, 5),
(25, '2026-01-20', 6, 5),
(26, '2026-02-10', 5, 11),
(27, '2026-02-10', 6, 11),
(28, '2026-02-10', 3, 11),
(29, '2026-01-20', 4, 6),
(30, '2026-01-20', 7, 6),
(31, '2026-01-20', 8, 6),
(32, '2026-01-25', 4, 7),
(33, '2026-01-25', 7, 7),
(34, '2026-01-25', 8, 7),
(35, '2026-01-28', 7, 8),
(36, '2026-01-28', 4, 8),
(37, '2026-01-28', 8, 8),
(38, '2026-02-10', 5, 12),
(39, '2026-02-10', 6, 12),
(40, '2026-02-10', 3, 12),
(41, '2026-02-10', 4, 12),
(42, '2026-02-20', 5, 13),
(43, '2026-02-20', 4, 13),
(44, '2026-02-20', 6, 13),
(45, '2026-03-10', 1, 14),
(46, '2026-03-10', 3, 14),
(47, '2026-03-10', 6, 14),
(48, '2026-03-10', 7, 14),
(49, '2026-03-10', 8, 14),
(50, '2026-03-25', 3, 15),
(51, '2026-03-25', 8, 15),
(52, '2026-03-25', 1, 15),
(53, '2026-04-02', 3, 16),
(54, '2026-04-02', 1, 16),
(55, '2026-04-02', 7, 16),
(56, '2026-04-02', 8, 16),
(57, '2026-04-10', 3, 17),
(58, '2026-04-10', 6, 17),
(59, '2026-04-10', 8, 17),
(60, '2026-04-12', 3, 18),
(61, '2026-04-12', 6, 18),
(62, '2026-04-12', 7, 18),
(63, '2026-04-13', 1, 19),
(64, '2026-04-13', 6, 19),
(65, '2026-04-13', 8, 19),
(66, '2026-04-13', 3, 19),
(67, '2026-04-18', 3, 2);

-- --------------------------------------------------------

--
-- Table structure for table `projekt_uzenet`
--

CREATE TABLE `projekt_uzenet` (
  `id` int(11) NOT NULL,
  `letrehozas_datum` timestamp NOT NULL DEFAULT current_timestamp(),
  `tartalom` text NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `projekt_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `projekt_uzenet`
--

INSERT INTO `projekt_uzenet` (`id`, `letrehozas_datum`, `tartalom`, `felhasznalo_id`, `projekt_id`) VALUES
(1, '2026-01-20 00:00:00', 'Az oldal alap layout elkészült.', 1, 1),
(2, '2026-02-05 00:00:00', 'Mobil nézeten még finomítani kell.', 2, 1),
(3, '2026-02-01 00:00:00', 'Kampány koncepció jóváhagyva.', 1, 2),
(4, '2026-03-10 00:00:00', 'Hirdetések még nem futnak.', 3, 2),
(5, '2026-02-15 00:00:00', 'Első dokumentumok feltöltve.', 2, 9),
(6, '2026-03-01 00:00:00', 'Dokumentáció lezárva.', 1, 3),
(7, '2026-03-10 00:00:00', 'API nagy része elkészült.', 2, 4),
(8, '2026-04-01 00:00:00', 'Teljesítmény optimalizálás szükséges.', 6, 4),
(9, '2026-03-15 00:00:00', 'Alap oldalak elkészültek.', 3, 10),
(10, '2026-02-10 00:00:00', 'Logó első verzió elkészült.', 6, 5),
(11, '2026-02-25 00:00:00', 'Színpaletta véglegesítve.', 5, 5),
(12, '2026-03-05 00:00:00', 'Feltöltés funkció működik.', 5, 11),
(13, '2026-01-25 00:00:00', 'Helyszín lefoglalva.', 4, 6),
(14, '2026-02-10 00:00:00', 'Jelentkezések megnyitva.', 7, 6),
(15, '2026-02-01 00:00:00', 'Edzés időpontok rögzítve.', 4, 7),
(16, '2026-02-15 00:00:00', 'Adatok részben hiányosak.', 7, 8),
(17, '2026-03-01 00:00:00', 'Első esemény sikeresen lezajlott.', 5, 12),
(18, '2026-03-10 00:00:00', 'Könyv kiválasztva.', 4, 13),
(19, '2026-03-20 00:00:00', 'Forgatókönyv véglegesítve.', 1, 14),
(20, '2026-04-05 00:00:00', 'Forgatás ütemezve.', 3, 14),
(21, '2026-04-01 00:00:00', 'Ügyfél visszajelzés megérkezett.', 3, 15),
(22, '2026-04-10 00:00:00', 'Casting folyamat elindult.', 1, 16),
(23, '2026-04-15 00:00:00', 'Terjesztési csatornák kiválasztva.', 6, 17),
(24, '2026-04-18 00:00:00', 'Projekt archiválva.', 3, 18),
(25, '2026-04-18 00:00:00', 'Vágás megkezdődött.', 6, 19),
(26, '2026-04-18 00:00:00', 'Hang utómunka folyamatban.', 8, 19);

-- --------------------------------------------------------

--
-- Table structure for table `tarsasagok`
--

CREATE TABLE `tarsasagok` (
  `id` int(11) NOT NULL,
  `nev` varchar(200) NOT NULL,
  `letrehozas_datum` date DEFAULT curdate(),
  `alapito_id` int(11) DEFAULT NULL,
  `aktiv` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `tarsasagok`
--

INSERT INTO `tarsasagok` (`id`, `nev`, `letrehozas_datum`, `alapito_id`, `aktiv`) VALUES
(1, 'Teszt Induló Kft.', '2026-01-06', 1, 1),
(2, 'FlowPlan Bt.', '2026-01-10', 2, 1),
(3, 'Kreatív Zrt.', '2026-01-15', 1, 1),
(4, 'Teszt Egyesület', '2026-01-20', 4, 1),
(5, 'Teszt Klub', '2026-02-01', 4, 1),
(6, 'Teszt Filmstúdió Zrt', '2026-03-01', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tarsasag_tartozik`
--

CREATE TABLE `tarsasag_tartozik` (
  `id` int(11) NOT NULL,
  `tarsasag_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `szerepkor` enum('admin','manager','tag') DEFAULT NULL,
  `csatlakozas_datum` date DEFAULT curdate(),
  `aktiv` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `tarsasag_tartozik`
--

INSERT INTO `tarsasag_tartozik` (`id`, `tarsasag_id`, `felhasznalo_id`, `szerepkor`, `csatlakozas_datum`, `aktiv`) VALUES
(1, 1, 1, 'admin', '2026-01-06', 1),
(2, 1, 2, 'manager', '2026-01-07', 1),
(3, 1, 3, 'tag', '2026-01-08', 1),
(4, 2, 2, 'admin', '2026-01-10', 1),
(5, 2, 1, 'admin', '2026-01-11', 1),
(6, 2, 3, 'manager', '2026-01-12', 1),
(7, 2, 6, 'tag', '2026-04-19', 1),
(8, 2, 7, 'tag', '2026-01-14', 1),
(9, 3, 3, 'admin', '2026-01-15', 1),
(10, 3, 1, 'admin', '2026-01-16', 1),
(11, 3, 5, 'manager', '2026-01-17', 1),
(12, 3, 6, 'tag', '2026-01-18', 1),
(13, 4, 4, 'admin', '2026-01-20', 1),
(14, 4, 7, 'manager', '2026-01-22', 1),
(15, 4, 8, 'tag', '2026-01-23', 1),
(16, 4, 2, 'tag', '2026-01-24', 0),
(17, 5, 5, 'admin', '2026-02-01', 1),
(18, 5, 6, 'manager', '2026-02-02', 1),
(19, 5, 3, 'tag', '2026-02-05', 1),
(20, 6, 1, 'admin', '2026-03-01', 1),
(21, 6, 3, 'manager', '2026-03-02', 1),
(22, 6, 6, 'tag', '2026-03-03', 1),
(23, 6, 7, 'tag', '2026-03-03', 1),
(24, 6, 8, 'tag', '2026-03-10', 1),
(25, 5, 4, 'admin', '2026-04-17', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `feladatok`
--
ALTER TABLE `feladatok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tulajdonos_id` (`tulajdonos_id`),
  ADD KEY `projekt_id` (`projekt_id`),
  ADD KEY `tarsasag_id` (`tarsasag_id`);

--
-- Indexes for table `feladat_reszvetel`
--
ALTER TABLE `feladat_reszvetel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `egyedi_tartozik` (`felhasznalo_id`,`feladat_id`),
  ADD KEY `feladat_id` (`feladat_id`);

--
-- Indexes for table `feladat_uzenet`
--
ALTER TABLE `feladat_uzenet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`),
  ADD KEY `feladat_id` (`feladat_id`);

--
-- Indexes for table `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `projektek`
--
ALTER TABLE `projektek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tulajdonos_id` (`tulajdonos_id`),
  ADD KEY `tarsasag_id` (`tarsasag_id`);

--
-- Indexes for table `projekt_reszvetel`
--
ALTER TABLE `projekt_reszvetel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `egyedi_reszvetel` (`felhasznalo_id`,`projekt_id`),
  ADD KEY `projekt_id` (`projekt_id`);

--
-- Indexes for table `projekt_uzenet`
--
ALTER TABLE `projekt_uzenet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`),
  ADD KEY `projekt_id` (`projekt_id`);

--
-- Indexes for table `tarsasagok`
--
ALTER TABLE `tarsasagok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alapito_id` (`alapito_id`);

--
-- Indexes for table `tarsasag_tartozik`
--
ALTER TABLE `tarsasag_tartozik`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tarsasag_tag` (`tarsasag_id`,`felhasznalo_id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `feladatok`
--
ALTER TABLE `feladatok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `feladat_reszvetel`
--
ALTER TABLE `feladat_reszvetel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT for table `feladat_uzenet`
--
ALTER TABLE `feladat_uzenet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `projektek`
--
ALTER TABLE `projektek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `projekt_reszvetel`
--
ALTER TABLE `projekt_reszvetel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `projekt_uzenet`
--
ALTER TABLE `projekt_uzenet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `tarsasagok`
--
ALTER TABLE `tarsasagok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tarsasag_tartozik`
--
ALTER TABLE `tarsasag_tartozik`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `feladatok`
--
ALTER TABLE `feladatok`
  ADD CONSTRAINT `feladatok_ibfk_1` FOREIGN KEY (`tulajdonos_id`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `feladatok_ibfk_2` FOREIGN KEY (`projekt_id`) REFERENCES `projektek` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feladatok_ibfk_3` FOREIGN KEY (`tarsasag_id`) REFERENCES `tarsasagok` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `feladat_reszvetel`
--
ALTER TABLE `feladat_reszvetel`
  ADD CONSTRAINT `feladat_reszvetel_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feladat_reszvetel_ibfk_2` FOREIGN KEY (`feladat_id`) REFERENCES `feladatok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `feladat_uzenet`
--
ALTER TABLE `feladat_uzenet`
  ADD CONSTRAINT `feladat_uzenet_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feladat_uzenet_ibfk_2` FOREIGN KEY (`feladat_id`) REFERENCES `feladatok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projektek`
--
ALTER TABLE `projektek`
  ADD CONSTRAINT `projektek_ibfk_1` FOREIGN KEY (`tulajdonos_id`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projektek_ibfk_2` FOREIGN KEY (`tarsasag_id`) REFERENCES `tarsasagok` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `projekt_reszvetel`
--
ALTER TABLE `projekt_reszvetel`
  ADD CONSTRAINT `projekt_reszvetel_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projekt_reszvetel_ibfk_2` FOREIGN KEY (`projekt_id`) REFERENCES `projektek` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projekt_uzenet`
--
ALTER TABLE `projekt_uzenet`
  ADD CONSTRAINT `projekt_uzenet_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projekt_uzenet_ibfk_2` FOREIGN KEY (`projekt_id`) REFERENCES `projektek` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tarsasagok`
--
ALTER TABLE `tarsasagok`
  ADD CONSTRAINT `tarsasagok_ibfk_1` FOREIGN KEY (`alapito_id`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tarsasag_tartozik`
--
ALTER TABLE `tarsasag_tartozik`
  ADD CONSTRAINT `tarsasag_tartozik_ibfk_1` FOREIGN KEY (`tarsasag_id`) REFERENCES `tarsasagok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tarsasag_tartozik_ibfk_2` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
