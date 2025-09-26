import axios from "axios";
import yts from "yt-search";

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "🎶 Ingresa el nombre de alguna canción" },
      { quoted: msg }
    );
  }

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "🕒", key: msg.key } });

  const res = await yts({ query: text, hl: "es", gl: "MX" });
  const song = res.videos[0];
  if (!song) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    );
  }

  const { url: videoUrl, title, timestamp: duration, author, thumbnail } = song;
  const artista = author.name;

  const tryApi = async (apiName, urlBuilder) => {
    try {
      const r = await axios.get(urlBuilder(), { timeout: 7000 });
      const audioUrl = r.data?.result?.url || r.data?.data?.url;
      if (audioUrl) return { url: audioUrl, api: apiName };
      throw new Error(`${apiName}: No entregó URL válido`);
    } catch (err) {
      throw new Error(`${apiName}: ${err.message}`);
    }
  };

  const apis = [
    () => tryApi("Api 1M", () => `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&quality=64&apikey=may-0595dca2`),
    () => tryApi("Api 2A", () => `https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}&quality=64`),
    () => tryApi("Api 3F", () => `https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}&quality=64`),
    () => tryApi("Vreden", () => `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=64`),
    () => tryApi("Zenkey", () => `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}&quality=64`)
  ];

  const tryDownload = async () => {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await Promise.any(apis.map(api => api()));
      } catch (err) {
        lastError = err;
        if (attempt < 3) {
          await conn.sendMessage(msg.key.remoteJid, { react: { text: "🔄", key: msg.key } });
        }
        if (attempt === 3) throw lastError;
      }
    }
  };

  try {
    const winner = await tryDownload();
    const audioDownloadUrl = winner.url;

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: thumbnail },
        caption: `
> *𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

⭒ ִֶָ७ ꯭🎵˙⋆｡ - *𝚃𝚒́𝚝𝚞𝚕𝚘:* ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* 64kbps
⭒ ִֶָ७ ꯭🌐˙⋆｡ - *𝙰𝚙𝚒:* ${winner.api}

*» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧*
*» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...*

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝗱 𝖻𝗒 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓.𝗑𝗒𝗓\`\`\`
        `.trim()
      },
      { quoted: msg }
    );

    await conn.sendMessage(msg.key.remoteJid, {
      audio: { url: audioDownloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${title.slice(0, 30)}.mp3`.replace(/[^\w\s.-]/gi, ''),
      ptt: false
    }, { quoted: msg });

    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

  } catch (e) {
    const errorMsg = typeof e === "string"
      ? e
      : `❌ *Error:* ${e.message || "Ocurrió un problema"}\n\n🔸 *Posibles soluciones:*\n• Verifica el nombre de la canción\n• Intenta con otro tema\n• Prueba más tarde`;

    await conn.sendMessage(msg.key.remoteJid, { text: errorMsg }, { quoted: msg });
  }
};

handler.command = ["play"];
export default handler;