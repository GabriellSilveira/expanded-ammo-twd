# Expanded Ammo TWD

![Foundry v12 / v13](https://img.shields.io/badge/Foundry-v12%20%7C%20v13-orange)
![System twdu](https://img.shields.io/badge/System-twdu-red)
![Languages EN | PT-BR](https://img.shields.io/badge/Languages-EN%20%7C%20PT--BR-blue)

An unofficial Foundry VTT module for **The Walking Dead Universe RPG (`twdu`)** that introduces automatic ammunition tracking and consumption — supporting both **weapon-specific ammo types** and a **single generic ammo mode**, bundled with a **ready-to-use Compendium**.

> 🇧🇷 **Suporte a Português (Brasil):** Este módulo possui suporte nativo completo para **Inglês (EN)** e **Português do Brasil (PT-BR)**, incluindo itens prontos no compêndio e detecção automática de armas e munições nos dois idiomas.

---

## Features

- **Built-in Compendium (`Expanded Ammo TWD`):** Pre-configured ammunition items (`tinyItem`) in both **English** and **Brazilian Portuguese** ready to drag and drop onto character sheets — no manual item creation or typos required.
- **Two Ammunition Modes:**
  - **By Weapon Type (Default):** Each firearm/ranged weapon category consumes its specific ammo type (*Pistol Ammo*, *Shotgun Shell*, *Rifle Ammo*, *Arrow*, *Bolt*, *Rocket*, *Tank Shell*).
  - **Generic Ammunition Mode:** All mapped ranged weapons consume a single universal **`Ammo`** / **`Munição`** item.
- **Automatic Item Stacking:** Dragging matching ammo onto a character sheet automatically merges them into a single clean counter (e.g., `Pistol Ammo (5)`).
- **Automatic Depletion & Non-Blocking Alerts:** Consumes 1 unit per shot and posts a warning in chat when out of ammo without blocking any rolls or actions.
- **Push-Safe:** Automatically ignores pushed rolls so players are never charged twice for the same shot.
- **Quality Agnostic:** Automatically strips weapon quality tags (`Acceptable`, `Excellent`, `Poor`, `Broken`, `Aceitável`, `Excelente`, `Ruim`, `Quebrado`) when matching weapons.

---

## Installation

1. Open Foundry VTT and go to the **Add-on Modules** tab.
2. Click **Install Module**.
3. Paste the following manifest URL into the **Manifest URL** field:
   ```text
   [https://raw.githubusercontent.com/SEU_USUARIO/expanded-ammo-twd/main/module.json](https://raw.githubusercontent.com/SEU_USUARIO/expanded-ammo-twd/main/module.json)