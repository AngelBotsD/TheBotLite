import fetch from 'node-fetch';

let handler = async (m, { conn, args, command, usedPrefix}) => {
  const url = args[0];
  if (!url ||!url.includes('spotify.com')) {
    return m.reply(
      `╭─⬣「 *SASUKE* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ ${usedPrefix + command} https://open.spotify.com/track/ID
╰─⬣`
);
}

  try {
    const res = await fetch(`https://api.lolhuman.xyz/api/spotify?apikey=beta&url=${encodeURIComponent(url)}`);
    const json = await res.json();

    if (!json.status ||!json.result?.link) {
      return m.reply(`╭─⬣「 *SASUKE* 」⬣
│ ≡◦ ❌ *No se encontró resultado para:* ${url}
╰─⬣`);
}

    const { title, artists, thumbnail, link} = json.result;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail},
      caption: `╭─⬣「 *INFO SPOTIFY* 」⬣
│ ≡◦ 🎵 *Título:* ${title}
│ ≡◦ 👤 *Artista:* ${artists}
│ ≡◦ 🌐 *Spotify:* ${link}
╰─⬣`
}, { quoted: m});

} catch (e) {
    console.error(e);
    return m.reply(`╭─⬣「 *SASUKE* 」⬣
│ ≡◦ ⚠️ *Error al procesar la solicitud.*
│ ≡◦ Intenta nuevamente más tarde.
╰─⬣`);
}
};

handler.help = ['spotify <url>'];
handler.tags = ['descargas'];
handler.command = /^\.spotify$/i;

export default handler;