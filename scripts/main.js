const MODULE_ID = "expanded-ammo-twd";

const AMMO_TYPES = {
  generic: { "pt-BR": "Munição", "en": "Ammo" },
  pistol: { "pt-BR": "Munição de Pistola", "en": "Pistol Ammo" },
  shotgun: { "pt-BR": "Cartucho de Espingarda", "en": "Shotgun Shell" },
  rifle: { "pt-BR": "Munição de Fuzil", "en": "Rifle Ammo" },
  arrow: { "pt-BR": "Flecha", "en": "Arrow" },
  bolt: { "pt-BR": "Virote", "en": "Bolt" },
  rocket: { "pt-BR": "Foguete", "en": "Rocket" },
  tank: { "pt-BR": "Munição de Tanque", "en": "Tank Shell" }
};

const WEAPON_AMMO_MAP = {
  // Pistols / Revolvers / SMGs
  "pistola ou revólver": "pistol",
  "pistol or revolver": "pistol",
  "pistola": "pistol",
  "pistol": "pistol",
  "revólver": "pistol",
  "revolver": "pistol",
  "submetralhadora": "pistol",
  "submachine gun": "pistol",

  // Shotguns / Pipe Guns
  "espingarda": "shotgun",
  "shotgun": "shotgun",
  "arma de cano": "shotgun",
  "pipe gun": "shotgun",

  // Rifles / Heavy MGs
  "fuzil": "rifle",
  "rifle": "rifle",
  "rifle de caça": "rifle",
  "fuzil de caça": "rifle",
  "hunting rifle": "rifle",
  "fuzil de assalto": "rifle",
  "assault rifle": "rifle",
  "fuzil de precisão": "rifle",
  "sniper rifle": "rifle",
  "metralhadora pesada": "rifle",
  "heavy machine gun": "rifle",

  // Bows & Crossbows
  "arco": "arrow",
  "arco e flecha": "arrow",
  "bow": "arrow",
  "besta": "bolt",
  "crossbow": "bolt",

  // Heavy Ordnance
  "lança-foguetes": "rocket",
  "rocket launcher": "rocket",
  "canhão de tanque": "tank",
  "tank cannon": "tank"
};

const ALL_AMMO_NAMES = Object.values(AMMO_TYPES).flatMap(obj => [obj["pt-BR"], obj["en"]]);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseAmmoItem(itemName) {
  const trimmed = itemName.trim();
  for (const validName of ALL_AMMO_NAMES) {
    const exactRegex = new RegExp(`^${escapeRegExp(validName)}$`, "i");
    if (exactRegex.test(trimmed)) {
      return { baseName: validName, quantity: 1 };
    }
    const countRegex = new RegExp(`^${escapeRegExp(validName)}\\s*\\((\\d+)\\)$`, "i");
    const match = trimmed.match(countRegex);
    if (match) {
      return { baseName: validName, quantity: parseInt(match[1], 10) };
    }
  }
  return null;
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "enabled", {
    name: "EXPANDED_AMMO_TWD.Settings.EnabledName",
    hint: "EXPANDED_AMMO_TWD.Settings.EnabledHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "ammoMode", {
    name: "EXPANDED_AMMO_TWD.Settings.AmmoModeName",
    hint: "EXPANDED_AMMO_TWD.Settings.AmmoModeHint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "byType": "EXPANDED_AMMO_TWD.Settings.ModeByType",
      "generic": "EXPANDED_AMMO_TWD.Settings.ModeGeneric"
    },
    default: "byType"
  });

  game.settings.register(MODULE_ID, "notifyOnConsume", {
    name: "EXPANDED_AMMO_TWD.Settings.NotifyOnConsumeName",
    hint: "EXPANDED_AMMO_TWD.Settings.NotifyOnConsumeHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
});

/**
 * Empilhamento automático ao arrastar munições para a ficha
 */
Hooks.on("preCreateItem", (item, data, options, userId) => {
  if (userId !== game.user.id) return;
  const actor = item.parent;
  if (!actor || !(actor instanceof Actor)) return;

  const incomingParsed = parseAmmoItem(item.name);
  if (!incomingParsed) return;

  const existingItem = actor.items.find(i => {
    const parsed = parseAmmoItem(i.name);
    return parsed && parsed.baseName.toLowerCase() === incomingParsed.baseName.toLowerCase();
  });

  if (existingItem) {
    const existingParsed = parseAmmoItem(existingItem.name);
    const totalQty = existingParsed.quantity + incomingParsed.quantity;
    const newName = `${existingParsed.baseName} (${totalQty})`;

    existingItem.update({ name: newName });
    return false;
  }
});

/**
 * Consumo automático ao disparar arma
 */
Hooks.on("createChatMessage", async (msg) => {
  if (!game.settings.get(MODULE_ID, "enabled")) return;
  if (msg.author?.id !== game.user.id) return;

  const roll = msg.rolls?.[0];
  if (!roll) return;
  if (roll.pushed || roll.options?.pushed) return;

  const actor = msg.speaker?.actor ? game.actors.get(msg.speaker.actor) : null;
  if (!actor) return;

  let rolledName = (roll.options?.name || msg.flavor || "").trim();
  if (!rolledName && msg.content) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = msg.content;
    const headerEl = tempDiv.querySelector(".header, .chat-flavor");
    if (headerEl) rolledName = headerEl.textContent.trim();
  }

  if (!rolledName) return;

  const baseWeaponName = rolledName
    .replace(/\s*\((Aceitável\vert{}Excelente\vert{}Quebrado\vert{}Ruim\vert{}Acceptable\vert{}Excellent\vert{}Broken\vert{}Poor)\)$/i, "")
    .trim()
    .toLowerCase();

  const detectedCategory =
    WEAPON_AMMO_MAP[baseWeaponName] ||
    Object.entries(WEAPON_AMMO_MAP).find(([key]) => baseWeaponName.includes(key))?.[1];

  if (!detectedCategory) return;

  // Define se usa a categoria específica da arma ou a categoria genérica conforme configuração
  const ammoMode = game.settings.get(MODULE_ID, "ammoMode");
  const ammoCategory = ammoMode === "generic" ? "generic" : detectedCategory;

  const ammoNames = AMMO_TYPES[ammoCategory];
  const currentLang = game.i18n.lang === "pt-BR" ? "pt-BR" : "en";
  const displayAmmoName = ammoNames[currentLang];

  const validNames = [ammoNames["pt-BR"], ammoNames["en"]];
  const escapedNames = validNames.map(escapeRegExp).join("|");
  const counterRegex = new RegExp(`^(${escapedNames})\\s*\\((\\d+)\\)$`, "i");

  const matchingItems = actor.items.filter(item => {
    const n = item.name.trim();
    return validNames.some(v => v.toLowerCase() === n.toLowerCase()) || counterRegex.test(n);
  });

  if (matchingItems.length === 0) {
    const title = game.i18n.localize("EXPANDED_AMMO_TWD.Chat.OutOfAmmoTitle");
    const body = game.i18n.format("EXPANDED_AMMO_TWD.Chat.OutOfAmmoBody", {
      actor: actor.name,
      weapon: rolledName,
      ammo: displayAmmoName
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <div style="border: 1px solid #7a1c1c; background: rgba(122, 28, 28, 0.14); padding: 6px; text-align: center; font-size: 12px;">
          <strong style="color: #7a1c1c; text-transform: uppercase;">${title}</strong><br>
          ${body}
        </div>
      `
    });
    return;
  }

  const stackedCounterItem = matchingItems.find(i => counterRegex.test(i.name.trim()));
  let remainingTotal = 0;

  if (stackedCounterItem) {
    const match = stackedCounterItem.name.trim().match(counterRegex);
    const baseMatchedName = match[1];
    const currentQty = parseInt(match[2], 10);
    const nextQty = currentQty - 1;

    if (nextQty <= 0) {
      await actor.deleteEmbeddedDocuments("Item", [stackedCounterItem.id]);
    } else {
      await stackedCounterItem.update({ name: `${baseMatchedName} (${nextQty})` });
    }

    remainingTotal = actor.items.reduce((acc, i) => {
      const n = i.name.trim();
      if (validNames.some(v => v.toLowerCase() === n.toLowerCase())) return acc + 1;
      const m = n.match(counterRegex);
      return m ? acc + parseInt(m[2], 10) : acc;
    }, 0);
  } else {
    await actor.deleteEmbeddedDocuments("Item", [matchingItems[0].id]);
    remainingTotal = matchingItems.length - 1;
  }

  if (!game.settings.get(MODULE_ID, "notifyOnConsume")) return;

  const textColor = remainingTotal === 0 ? "#7a1c1c" : "#3a3532";
  const spentLabel = game.i18n.format("EXPANDED_AMMO_TWD.Chat.SpentLabel", { ammo: displayAmmoName });
  const remainingText = remainingTotal === 0
    ? `<strong style="color: #7a1c1c;">${game.i18n.localize("EXPANDED_AMMO_TWD.Chat.EmptyRemaining")}</strong>`
    : game.i18n.format("EXPANDED_AMMO_TWD.Chat.RemainingCount", { count: remainingTotal });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div style="border: 1px solid rgba(58, 53, 50, 0.35); background: rgba(58, 53, 50, 0.08); padding: 5px 8px; text-align: center; font-size: 11px; color: ${textColor};">
        🔸 <strong>${spentLabel}</strong> (${remainingText})
      </div>
    `
  });
});