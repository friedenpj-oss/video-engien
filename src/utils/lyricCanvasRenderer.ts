import { SongMetadata } from '../types/index';
import { StylePreset } from '../types/styles';

export interface RenderLyricOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  text: string;
  songMetadata?: SongMetadata;
  progress: number; // 0.0 to 1.0 within current beat
  stylePreset?: StylePreset;
  isPortrait: boolean;
  time: number;
  artistImage?: HTMLImageElement | null;
}

/**
 * Draws torn jagged paper edge along a path with realistic fiber imperfections
 */
export function drawTornPaperEdge(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  paperWidth: number,
  direction: 'left' | 'right' | 'top' | 'bottom',
  seed: number = 42
) {
  ctx.save();
  ctx.fillStyle = '#f8f9fa';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;

  // Shadow for paper tear depth
  ctx.shadowColor = 'rgba(0, 10, 40, 0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = direction === 'left' ? 4 : direction === 'right' ? -4 : 0;
  ctx.shadowOffsetY = direction === 'top' ? 4 : direction === 'bottom' ? -4 : 0;

  ctx.beginPath();
  const segments = 24;
  const dx = (endX - startX) / segments;
  const dy = (endY - startY) / segments;

  ctx.moveTo(startX, startY);

  let currentX = startX;
  let currentY = startY;

  for (let i = 1; i <= segments; i++) {
    const targetX = startX + dx * i;
    const targetY = startY + dy * i;
    // Pseudorandom jagged tear variance
    const pseudo = Math.sin(i * 997 + seed) * 48271 % 1;
    const jag = (pseudo * 14) - 7;

    const midX = (currentX + targetX) / 2 + (direction === 'left' || direction === 'right' ? jag : 0);
    const midY = (currentY + targetY) / 2 + (direction === 'top' || direction === 'bottom' ? jag : 0);

    ctx.quadraticCurveTo(midX, midY, targetX, targetY);
    currentX = targetX;
    currentY = targetY;
  }

  // Close back around the paper strip bounding edge
  if (direction === 'left') {
    ctx.lineTo(startX - paperWidth, endY);
    ctx.lineTo(startX - paperWidth, startY);
  } else if (direction === 'right') {
    ctx.lineTo(startX + paperWidth, endY);
    ctx.lineTo(startX + paperWidth, startY);
  } else if (direction === 'bottom') {
    ctx.lineTo(endX, startY + paperWidth);
    ctx.lineTo(startX, startY + paperWidth);
  } else if (direction === 'top') {
    ctx.lineTo(endX, startY - paperWidth);
    ctx.lineTo(startX, startY - paperWidth);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle paper grain stripes
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let s = 0; s < 6; s++) {
    const rx = startX + (Math.sin(s * 13 + seed) * 12);
    ctx.fillRect(rx, startY, 2, endY - startY);
  }

  ctx.restore();
}

/**
 * Draws 3D Blue Metallic Inflatable Foil Balloon Typography
 * (Matching the "ITALAWA" 3D blue foil balloon title style in the user's poster)
 */
export function draw3DBlueBalloonText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  fontSize: number
) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fontSize}px "Montserrat", "Arial Black", sans-serif`;

  // 1. Deep balloon drop shadow
  ctx.shadowColor = 'rgba(0, 18, 70, 0.6)';
  ctx.shadowBlur = fontSize * 0.22;
  ctx.shadowOffsetY = fontSize * 0.12;

  // 2. Base deep cobalt balloon body
  ctx.fillStyle = '#0a3cd6';
  ctx.fillText(text, centerX, centerY + fontSize * 0.04);

  // 3. Main vibrant royal blue foil surface
  const foilGrad = ctx.createLinearGradient(0, centerY - fontSize * 0.6, 0, centerY + fontSize * 0.6);
  foilGrad.addColorStop(0, '#1052f5');
  foilGrad.addColorStop(0.2, '#3880ff');
  foilGrad.addColorStop(0.4, '#1b63ff');
  foilGrad.addColorStop(0.7, '#003ecb');
  foilGrad.addColorStop(1, '#00258a');

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = foilGrad;
  ctx.fillText(text, centerX, centerY);

  // 4. Inflatable crease borders & seams
  ctx.strokeStyle = '#002280';
  ctx.lineWidth = Math.max(2, fontSize * 0.04);
  ctx.strokeText(text, centerX, centerY);

  // 5. Glossy specular balloon reflection (upper curve highlight)
  ctx.save();
  ctx.beginPath();
  const metrics = ctx.measureText(text);
  ctx.rect(centerX - metrics.width / 2, centerY - fontSize * 0.5, metrics.width, fontSize * 0.45);
  ctx.clip();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText(text, centerX, centerY + 1);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, centerX, centerY - fontSize * 0.04);
  ctx.restore();

  // 6. Inflatable corner specular glow accents
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `bold ${fontSize * 0.96}px "Montserrat", sans-serif`;
  ctx.fillText(text, centerX, centerY - fontSize * 0.02);

  ctx.restore();
}

/**
 * Procedural Audio Studio Mixer & Monitor Speaker Sketch in Blue Line Art
 * (Modeled on the mixing console blueprint in the user's uploaded poster)
 */
export function drawStudioMixerSketch(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.strokeStyle = '#0047cc';
  ctx.lineWidth = 1.8;
  ctx.fillStyle = '#ffffff';

  // Paper card background
  ctx.fillRect(startX, startY, width, height);
  ctx.strokeRect(startX, startY, width, height);

  // Studio Monitor Speaker 1 (Left)
  const spW = width * 0.42;
  const spH = height * 0.55;
  const spX = startX + width * 0.05;
  const spY = startY + height * 0.06;

  // Speaker box 3D isometric
  ctx.beginPath();
  ctx.rect(spX, spY, spW, spH);
  ctx.stroke();

  // Speaker 3D depth top and side
  ctx.beginPath();
  ctx.moveTo(spX, spY);
  ctx.lineTo(spX + 18, spY - 14);
  ctx.lineTo(spX + spW + 18, spY - 14);
  ctx.lineTo(spX + spW, spY);
  ctx.lineTo(spX + spW + 18, spY - 14);
  ctx.lineTo(spX + spW + 18, spY + spH - 14);
  ctx.lineTo(spX + spW, spY + spH);
  ctx.stroke();

  // Woofer circle & tweeter
  const wooferCx = spX + spW * 0.5;
  const wooferCy = spY + spH * 0.65;
  const wooferR = spW * 0.32;
  ctx.beginPath();
  ctx.arc(wooferCx, wooferCy, wooferR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(wooferCx, wooferCy, wooferR * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(wooferCx, wooferCy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tweeter
  const tweetCy = spY + spH * 0.25;
  ctx.beginPath();
  ctx.arc(wooferCx, tweetCy, spW * 0.14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(wooferCx, tweetCy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Hatching on speaker top
  for (let h = 0; h < 8; h++) {
    ctx.beginPath();
    ctx.moveTo(spX + 4 + h * 12, spY);
    ctx.lineTo(spX + 18 + h * 12, spY - 14);
    ctx.stroke();
  }

  // Audio Spectrum / Studio Screen 2 (Right)
  const scX = startX + width * 0.52;
  const scW = width * 0.42;
  ctx.strokeRect(scX, spY, scW, spH * 0.85);

  // Frequency bands / bar graph sketch
  const barCount = 7;
  const barW = (scW - 24) / barCount;
  for (let b = 0; b < barCount; b++) {
    const barH = (spH * 0.65) * (0.3 + 0.6 * Math.sin(b * 1.3 + 0.5));
    ctx.fillStyle = '#0047cc';
    ctx.fillRect(scX + 12 + b * barW, spY + spH * 0.8 - barH, barW * 0.7, barH);
  }

  // Mixing Console Channel Faders Desk (Bottom)
  const deskY = startY + height * 0.64;
  const deskH = height * 0.34;
  ctx.strokeRect(startX + 8, deskY, width - 16, deskH);

  const channels = 9;
  const chW = (width - 32) / channels;
  for (let c = 0; c < channels; c++) {
    const chX = startX + 16 + c * chW;
    // Fader groove line
    ctx.beginPath();
    ctx.moveTo(chX + chW * 0.5, deskY + 12);
    ctx.lineTo(chX + chW * 0.5, deskY + deskH - 12);
    ctx.stroke();

    // Fader knob cap (isometric 3D rectangular block)
    const knobPos = deskY + 18 + ((c * 23) % Math.floor(deskH - 36));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(chX + chW * 0.15, knobPos, chW * 0.7, 14);
    ctx.strokeRect(chX + chW * 0.15, knobPos, chW * 0.7, 14);

    // Knob top notch
    ctx.beginPath();
    ctx.moveTo(chX + chW * 0.15, knobPos + 7);
    ctx.lineTo(chX + chW * 0.85, knobPos + 7);
    ctx.stroke();

    // Rotary EQ knob sketch at top of strip
    ctx.beginPath();
    ctx.arc(chX + chW * 0.5, deskY + 6, 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 1. Wondernitz Auto-Block Stack Renderer
 * Directly implements the typographic layout of User Poster 1 (Italawa royal blue lyric poster):
 * - Cobalt blue paper crumpled background
 * - Ripped vertical white paper strips on borders
 * - Dynamic line-by-line sizing: short words (e.g. "EVER", "LINE") scale HUGE (110-140px)
 *   while multi-word phrases (e.g. "I NO FIT", "STAND FOR") scale compact to span the EXACT SAME width!
 * - 3D Blue Balloon Inflatable Title ("ITALAWA")
 * - Artist Sub-footer ("RABOSKI • COMING SOON")
 */
export function renderWondernitzBlock(options: RenderLyricOptions) {
  const { ctx, width, height, text, songMetadata, isPortrait } = options;

  // 1. Fill vibrant royal cobalt blue background
  const bgGrad = ctx.createRadialGradient(
    width * 0.5, height * 0.45, width * 0.1,
    width * 0.5, height * 0.5, width * 0.8
  );
  bgGrad.addColorStop(0, '#0047e0');
  bgGrad.addColorStop(0.5, '#0033b8');
  bgGrad.addColorStop(1, '#001e7d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Paper creases & subtle grain folds
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  for (let c = 0; c < 12; c++) {
    const cy = height * 0.1 + c * (height * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width * 0.35, cy + 18);
    ctx.lineTo(width * 0.65, cy - 12);
    ctx.lineTo(width, cy + 14);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Torn vertical paper strips on left and right borders
  const stripW = isPortrait ? width * 0.13 : width * 0.09;
  // Left shredded strips (multiple layered cuts)
  drawTornPaperEdge(ctx, stripW * 0.4, 0, stripW * 0.4, height * 0.82, stripW * 0.6, 'left', 11);
  drawTornPaperEdge(ctx, stripW * 0.9, 0, stripW * 0.9, height * 0.82, stripW * 0.8, 'left', 29);
  drawTornPaperEdge(ctx, stripW * 1.35, 0, stripW * 1.35, height * 0.82, stripW * 0.7, 'left', 47);

  // Right shredded strips
  drawTornPaperEdge(ctx, width - stripW * 0.4, 0, width - stripW * 0.4, height * 0.82, stripW * 0.6, 'right', 63);
  drawTornPaperEdge(ctx, width - stripW * 0.9, 0, width - stripW * 0.9, height * 0.82, stripW * 0.8, 'right', 81);
  drawTornPaperEdge(ctx, width - stripW * 1.35, 0, width - stripW * 1.35, height * 0.82, stripW * 0.7, 'right', 97);

  // Diagonal torn paper banner crossing right side (like in poster 1)
  ctx.save();
  ctx.translate(width * 0.82, height * 0.42);
  ctx.rotate(0.35);
  ctx.fillStyle = '#f8f9fa';
  ctx.shadowColor = 'rgba(0,10,40,0.4)';
  ctx.shadowBlur = 10;
  ctx.fillRect(-stripW * 0.4, -height * 0.25, stripW * 0.8, height * 0.5);
  ctx.restore();

  // 3. Dynamic Wondernitz Justified Typographic Block
  // Break text into lines. If text has newlines or slashes, preserve them; otherwise group into punchy rows.
  let lines: string[] = [];
  if (text.includes('\n')) {
    lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  } else if (text.includes('/')) {
    lines = text.split('/').map(l => l.trim()).filter(Boolean);
  } else {
    // Smart split into 3-4 justified rows (like "I NO FIT / EVER / STAND FOR / LINE")
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= 4) {
      lines = words;
    } else if (words.length <= 6) {
      lines = [
        words.slice(0, 2).join(' '),
        words.slice(2, 3).join(' '),
        words.slice(3, 5).join(' '),
        words.slice(5).join(' ')
      ].filter(Boolean);
    } else {
      // 4 balanced chunks
      const chunk = Math.ceil(words.length / 4);
      for (let i = 0; i < words.length; i += chunk) {
        lines.push(words.slice(i, i + chunk).join(' '));
      }
    }
  }

  // Target bounding width where all lines MUST flush to left and right margins!
  const blockLeft = stripW * 1.5;
  const blockRight = width - stripW * 1.5;
  const targetLineWidth = blockRight - blockLeft;
  const blockTop = isPortrait ? height * 0.07 : height * 0.05;
  const blockBottom = isPortrait ? height * 0.72 : height * 0.71;
  const availableHeight = blockBottom - blockTop;

  // 1st Pass: Measure natural width of each line at base font size (100px)
  // to calculate proportional vertical heights and font sizes
  ctx.save();
  const testBaseSize = 100;
  ctx.font = `900 ${testBaseSize}px "Bebas Neue", "Impact", "Arial Black", sans-serif`;

  const lineMetrics = lines.map(lineText => {
    const upper = lineText.toUpperCase();
    const rawW = Math.max(10, ctx.measureText(upper).width);
    // Ideal font size so this specific line stretches to targetLineWidth
    const idealSize = (targetLineWidth / rawW) * testBaseSize;
    return {
      text: upper,
      rawW,
      idealSize,
      // Visual letter height is ~0.84 of Bebas Neue font size
      approxHeight: idealSize * 0.84,
    };
  });

  // Calculate total vertical height needed if every line spanned targetLineWidth at 100% natural height
  const totalDesiredHeight = lineMetrics.reduce((sum, m) => sum + m.approxHeight, 0);
  // Scale down or up smoothly so the entire typographic puzzle fits availableHeight
  const verticalScale = Math.min(1.0, availableHeight / Math.max(1, totalDesiredHeight));

  // Compute final font sizes and Y centers
  const finalLines = lineMetrics.map(m => {
    const finalFontSize = Math.max(26, Math.round(m.idealSize * verticalScale));
    const finalHeight = finalFontSize * 0.84;
    return {
      ...m,
      finalFontSize,
      finalHeight,
    };
  });

  const totalFinalHeight = finalLines.reduce((sum, l) => sum + l.finalHeight, 0);
  const remainingGap = Math.max(0, availableHeight - totalFinalHeight);
  const lineSpacing = finalLines.length > 1 ? remainingGap / (finalLines.length + 1) : remainingGap / 2;

  let currentY = blockTop + lineSpacing;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  finalLines.forEach(item => {
    ctx.save();
    ctx.font = `900 ${item.finalFontSize}px "Bebas Neue", "Impact", "Arial Black", sans-serif`;

    // Drop shadow for stamped poster aesthetic
    ctx.shadowColor = 'rgba(0, 15, 60, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // Check actual measured width at this font size
    const actualW = ctx.measureText(item.text).width;
    const horizontalScale = actualW > 0 ? targetLineWidth / actualW : 1.0;

    // Center and scale horizontally to guarantee flush margins on both left and right edges
    ctx.translate(width * 0.5, currentY);
    ctx.scale(horizontalScale, 1.0);

    // Solid stark white poster lettering
    ctx.fillStyle = '#ffffff';
    ctx.fillText(item.text, 0, 0);

    ctx.restore();
    currentY += item.finalHeight + lineSpacing;
  });
  ctx.restore();

  // 4. Bottom Horizontal Torn Paper Ground Border (covering bottom 26% of poster)
  const bottomTornY = isPortrait ? height * 0.74 : height * 0.72;
  drawTornPaperEdge(ctx, 0, bottomTornY, width, bottomTornY, height - bottomTornY, 'bottom', 53);

  // 5. 3D Blue Balloon Title Slot (Modeled on "ITALAWA" in the reference poster)
  // Dynamically uses current track title from songMetadata
  const titleText = (songMetadata?.trackTitle || 'ITALAWA').toUpperCase();
  const balloonFontSize = isPortrait ? Math.round(width * 0.155) : Math.round(width * 0.085);
  const balloonY = isPortrait ? bottomTornY + height * 0.1 : bottomTornY + height * 0.12;
  draw3DBlueBalloonText(ctx, titleText, width * 0.5, balloonY, balloonFontSize);

  // 6. Artist Name Slot (Modeled on "RABOSKI" in the reference poster)
  // Dynamically uses artist name from songMetadata
  const artistText = (songMetadata?.artistName || 'RABOSKI').toUpperCase();
  const footerY = balloonY + balloonFontSize * 0.62;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Rule lines left and right of artist name
  const artistFontSize = isPortrait ? 18 : 14;
  ctx.font = `900 ${artistFontSize}px "Montserrat", sans-serif`;
  const artistMetrics = ctx.measureText(artistText);
  const ruleLen = isPortrait ? 70 : 90;

  ctx.strokeStyle = '#1b63ff';
  ctx.lineWidth = 2;
  // Left line
  ctx.beginPath();
  ctx.moveTo(width * 0.5 - artistMetrics.width * 0.5 - ruleLen - 16, footerY);
  ctx.lineTo(width * 0.5 - artistMetrics.width * 0.5 - 16, footerY);
  ctx.stroke();
  // Right line
  ctx.beginPath();
  ctx.moveTo(width * 0.5 + artistMetrics.width * 0.5 + 16, footerY);
  ctx.lineTo(width * 0.5 + artistMetrics.width * 0.5 + ruleLen + 16, footerY);
  ctx.stroke();

  // Artist text
  ctx.fillStyle = '#0a3cd6';
  ctx.fillText(artistText, width * 0.5, footerY);

  // 7. Dynamic Release / Lyric Information Slot (REPLACING "COMING SOON")
  // Dynamically pulls real song details: lyric writers, release year, or production status
  let subStatus = 'OFFICIAL LYRIC VIDEO';
  if (songMetadata?.songwriters) {
    subStatus = `LYRICS: ${songMetadata.songwriters.toUpperCase()}`;
  } else if (songMetadata?.releaseDate) {
    const year = new Date(songMetadata.releaseDate).getFullYear() || songMetadata.releaseDate;
    subStatus = `${year} • OFFICIAL LYRIC VIDEO`;
  } else if (songMetadata?.producers) {
    subStatus = `PRODUCED BY ${songMetadata.producers.toUpperCase()}`;
  }

  ctx.font = `700 ${isPortrait ? 13 : 11}px "Montserrat", sans-serif`;
  ctx.fillStyle = '#1b63ff';
  ctx.letterSpacing = '6px';
  ctx.fillText(subStatus, width * 0.5, footerY + (isPortrait ? 26 : 22));

  ctx.restore();
}

/**
 * 2. Studio Master Artist Spotlight & Mixer Sketch Renderer
 * Directly implements User Poster 2 (Raboski Mixing & Mastering):
 * - Top header tagline: "ONE ARTIST. EVERY LAYER." and track badge "04 / 04"
 * - Huge blue foil heading: "MIXING & MASTERING" / "Balance. Detail. Impact."
 * - Dedicated Artist Photo Cutout frame (with the uploaded artist photo)
 * - Blue ink studio mixer desk & studio monitor sketch
 * - Torn paper layers framing royal cobalt blue right edge
 * - 3D Blue Balloon Title ("ITALAWA") & Artist / Writers / Producer credits
 */
export function renderArtistSpotlight(options: RenderLyricOptions) {
  const { ctx, width, height, songMetadata, isPortrait, artistImage } = options;

  // Background: white textured torn paper with cobalt blue right side
  ctx.fillStyle = '#f4f6f8';
  ctx.fillRect(0, 0, width, height);

  // Right cobalt torn paper block (covering right 30% of screen)
  const rightTornX = isPortrait ? width * 0.72 : width * 0.75;
  const rightBgGrad = ctx.createLinearGradient(rightTornX, 0, width, 0);
  rightBgGrad.addColorStop(0, '#0047e0');
  rightBgGrad.addColorStop(1, '#001e7d');
  ctx.fillStyle = rightBgGrad;
  ctx.fillRect(rightTornX, 0, width - rightTornX, height);

  // Jagged torn edge separating white paper from blue right side
  drawTornPaperEdge(ctx, rightTornX, 0, rightTornX, height, width - rightTornX, 'left', 77);

  // 1. Top Header Bar: "ONE ARTIST. EVERY LAYER." & Track Counter "04 / 04"
  const topY = isPortrait ? 48 : 36;
  ctx.save();
  ctx.fillStyle = '#0033b8';
  ctx.font = `800 ${isPortrait ? 13 : 11}px "Montserrat", sans-serif`;
  ctx.textAlign = 'left';
  const tagline = (songMetadata?.tagline || 'ONE ARTIST. EVERY LAYER.').toUpperCase();
  ctx.fillText(tagline, isPortrait ? 36 : 48, topY);

  // Thin line after tagline
  const tagMetric = ctx.measureText(tagline);
  ctx.strokeStyle = '#0033b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo((isPortrait ? 36 : 48) + tagMetric.width + 16, topY - 4);
  ctx.lineTo((isPortrait ? 36 : 48) + tagMetric.width + 120, topY - 4);
  ctx.stroke();

  // Track badge right ("04 / 04" or track number)
  const trackNum = songMetadata?.trackNumber || '04 / 04';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0033b8';
  ctx.font = `900 ${isPortrait ? 15 : 13}px "Montserrat", monospace`;
  ctx.fillText(trackNum, width - (isPortrait ? 36 : 48), topY);
  ctx.restore();

  // 2. Bold Blue Stencil Heading: "MIXING & MASTERING"
  const headingY = isPortrait ? height * 0.11 : height * 0.10;
  ctx.save();
  ctx.textAlign = 'left';
  const headX = isPortrait ? 36 : 48;
  const headFontSize = isPortrait ? Math.round(width * 0.11) : Math.round(width * 0.055);
  ctx.font = `900 ${headFontSize}px "Bebas Neue", "Impact", sans-serif`;

  // Deep blue foil gradient for headline
  const headGrad = ctx.createLinearGradient(0, headingY, 0, headingY + headFontSize * 1.6);
  headGrad.addColorStop(0, '#00259e');
  headGrad.addColorStop(0.5, '#004ee6');
  headGrad.addColorStop(1, '#001a75');
  ctx.fillStyle = headGrad;
  ctx.shadowColor = 'rgba(0, 20, 80, 0.25)';
  ctx.shadowBlur = 8;
  ctx.fillText('MIXING &', headX, headingY + headFontSize * 0.8);
  ctx.fillText('MASTERING', headX, headingY + headFontSize * 1.7);

  // Subtitle: "Balance. Detail. Impact."
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#0033b8';
  ctx.font = `800 ${isPortrait ? 16 : 13}px "Montserrat", sans-serif`;
  ctx.fillText('Balance. Detail. Impact.', headX, headingY + headFontSize * 1.7 + (isPortrait ? 32 : 24));
  ctx.restore();

  // 3. Studio Mixer & Monitor Blueprint Sketch (Left lower portion)
  const mixerW = isPortrait ? width * 0.46 : width * 0.35;
  const mixerH = isPortrait ? height * 0.32 : height * 0.42;
  const mixerX = isPortrait ? 28 : 42;
  const mixerY = isPortrait ? height * 0.38 : height * 0.26;
  drawStudioMixerSketch(ctx, mixerX, mixerY, mixerW, mixerH);

  // 4. Artist Photo Cutout Frame (Right side / center)
  // If artist image is loaded, draw real cutout; else draw high-fashion artist frame
  const artSlotW = isPortrait ? width * 0.58 : width * 0.38;
  const artSlotH = isPortrait ? height * 0.46 : height * 0.58;
  const artSlotX = isPortrait ? width * 0.38 : width * 0.52;
  const artSlotY = isPortrait ? height * 0.18 : height * 0.12;

  ctx.save();
  if (artistImage && artistImage.complete && artistImage.naturalWidth > 0) {
    // Drop shadow under artist
    ctx.shadowColor = 'rgba(0, 10, 40, 0.45)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = -6;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(artistImage, artSlotX, artSlotY, artSlotW, artSlotH);
  } else {
    // Stylized artist silhouette / placeholder with glasses & chain
    ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
    ctx.beginPath();
    ctx.roundRect(artSlotX, artSlotY, artSlotW, artSlotH, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `bold ${isPortrait ? 14 : 12}px sans-serif`;
    ctx.fillText('ARTIST CUTOUT SLOT', artSlotX + artSlotW / 2, artSlotY + artSlotH / 2);
    ctx.font = `${isPortrait ? 11 : 10}px monospace`;
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('Raboski Mixing & Mastering', artSlotX + artSlotW / 2, artSlotY + artSlotH / 2 + 22);
  }
  ctx.restore();

  // 5. Bottom Torn Paper Banner (Covering lower 28% of poster)
  const bottomTornY = isPortrait ? height * 0.72 : height * 0.68;
  drawTornPaperEdge(ctx, 0, bottomTornY, width, bottomTornY, height - bottomTornY, 'bottom', 89);

  // 6. 3D Foil Balloon Title ("ITALAWA")
  const titleText = (songMetadata?.trackTitle || 'ITALAWA').toUpperCase();
  const balloonFontSize = isPortrait ? Math.round(width * 0.15) : Math.round(width * 0.08);
  const balloonY = isPortrait ? bottomTornY + height * 0.1 : bottomTornY + height * 0.11;
  draw3DBlueBalloonText(ctx, titleText, width * 0.5, balloonY, balloonFontSize);

  // 7. Songwriter & Producer Full Credits Footer
  const artistName = (songMetadata?.artistName || 'RABOSKI').toUpperCase();
  const footerY = balloonY + balloonFontSize * 0.58;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Artist Rule Line
  ctx.strokeStyle = '#0033b8';
  ctx.lineWidth = 1.5;
  const artFSize = isPortrait ? 16 : 13;
  ctx.font = `900 ${artFSize}px "Montserrat", sans-serif`;
  const aMet = ctx.measureText(artistName);

  ctx.beginPath();
  ctx.moveTo(width * 0.5 - aMet.width * 0.5 - 60, footerY);
  ctx.lineTo(width * 0.5 - aMet.width * 0.5 - 14, footerY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.5 + aMet.width * 0.5 + 14, footerY);
  ctx.lineTo(width * 0.5 + aMet.width * 0.5 + 60, footerY);
  ctx.stroke();

  ctx.fillStyle = '#0033b8';
  ctx.fillText(artistName, width * 0.5, footerY);

  // Production and songwriter credits
  const releaseYear = songMetadata?.releaseDate ? (new Date(songMetadata.releaseDate).getFullYear() || songMetadata.releaseDate) : '2025';
  const creditsLine = [
    songMetadata?.songwriters ? `WRITERS: ${songMetadata.songwriters.toUpperCase()}` : `WRITTEN BY: ${artistName}`,
    songMetadata?.producers ? `PRODUCER: ${songMetadata.producers.toUpperCase()}` : 'PROD: MASTER SOUNDLAB',
    songMetadata?.releaseDate ? `RELEASE: ${songMetadata.releaseDate}` : `OFFICIAL LYRIC VIDEO • ${releaseYear}`
  ].join('  •  ');

  ctx.font = `600 ${isPortrait ? 10 : 9}px "Montserrat", sans-serif`;
  ctx.fillStyle = '#1e40af';
  ctx.fillText(creditsLine, width * 0.5, footerY + (isPortrait ? 24 : 20));

  ctx.restore();
}

/**
 * 3. 3D Highway & Forest Perspective Runway
 * Lyrics painted flat on a perspective ground plane tilting toward the camera
 */
export function renderPerspective3D(options: RenderLyricOptions) {
  const { ctx, width, height, text, time, isPortrait } = options;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
  skyGrad.addColorStop(0, '#020308');
  skyGrad.addColorStop(1, '#0b1329');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.5);

  // Neon horizon sun glow
  const sunGrad = ctx.createRadialGradient(
    width * 0.5, height * 0.5, 5,
    width * 0.5, height * 0.5, width * 0.35
  );
  sunGrad.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
  sunGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
  sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, height * 0.25, width, height * 0.25);

  // Ground plane (Night asphalt highway)
  const groundGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
  groundGrad.addColorStop(0, '#0b0f19');
  groundGrad.addColorStop(1, '#05070a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  // Perspective road lines
  const horizonY = height * 0.5;
  const roadLeftX = width * 0.42;
  const roadRightX = width * 0.58;
  const bottomRoadLeftX = -width * 0.2;
  const bottomRoadRightX = width * 1.2;

  ctx.save();
  // Road asphalt
  ctx.beginPath();
  ctx.moveTo(roadLeftX, horizonY);
  ctx.lineTo(roadRightX, horizonY);
  ctx.lineTo(bottomRoadRightX, height);
  ctx.lineTo(bottomRoadLeftX, height);
  ctx.closePath();
  ctx.fillStyle = '#111624';
  ctx.fill();

  // Moving road centerline dashes
  const speed = (time * 2.5) % 1.0;
  const dashCount = 8;
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;

  for (let d = 0; d < dashCount; d++) {
    const p1 = (d / dashCount + speed / dashCount) % 1.0;
    const p2 = p1 + 0.06;
    if (p2 > 1.0) continue;

    // Exponential perspective curve
    const y1 = horizonY + Math.pow(p1, 2.2) * (height - horizonY);
    const y2 = horizonY + Math.pow(p2, 2.2) * (height - horizonY);
    const lw = 2 + Math.pow(p1, 2.0) * 14;

    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, y1);
    ctx.lineTo(width * 0.5, y2);
    ctx.stroke();
  }
  ctx.restore();

  // Draw 3D Perspective Projected Lyric Text
  ctx.save();
  // Transform context with 3D tilt
  ctx.translate(width * 0.5, height * 0.74);
  // Scale Y to simulate extreme forward tilt angle
  ctx.scale(1.0, 0.45);

  const upperText = text.toUpperCase();
  const fSize = isPortrait ? Math.round(width * 0.14) : Math.round(width * 0.08);
  ctx.font = `900 ${fSize}px "Orbitron", "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';

  // Extruded 3D depth underneath text
  for (let depth = 16; depth >= 0; depth--) {
    const alpha = (16 - depth) / 16;
    ctx.fillStyle = depth === 0 ? '#ffffff' : `rgba(244, 63, 94, ${alpha * 0.6})`;
    ctx.shadowColor = depth === 0 ? '#38bdf8' : 'transparent';
    ctx.shadowBlur = depth === 0 ? 25 : 0;
    ctx.fillText(upperText, 0, depth * 2.2);
  }

  ctx.restore();
}

/**
 * Procedural background renderers for lyric videos
 */
export function renderProceduralBackground(
  ctx: CanvasRenderingContext2D,
  theme: string,
  width: number,
  height: number,
  time: number
) {
  if (theme === 'royal_blue_torn_paper') {
    const grad = ctx.createRadialGradient(
      width * 0.5, height * 0.45, width * 0.1,
      width * 0.5, height * 0.5, width * 0.8
    );
    grad.addColorStop(0, '#0047e0');
    grad.addColorStop(0.6, '#0033b8');
    grad.addColorStop(1, '#001e7d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle paper wrinkles
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const y = height * (0.12 * i);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(width * 0.5, y + 25, width, y - 10);
      ctx.stroke();
    }
    ctx.restore();
  } else if (theme === 'studio_mixer_sketch') {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    drawStudioMixerSketch(ctx, 40, height * 0.25, width - 80, height * 0.5);
  } else if (theme === 'cosmic_nebula') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#090a14');
    grad.addColorStop(0.4, '#1e1b4b');
    grad.addColorStop(0.7, '#4c1d95');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let s = 0; s < 60; s++) {
      const sx = (Math.sin(s * 991) * 0.5 + 0.5) * width;
      const sy = (Math.cos(s * 733) * 0.5 + 0.5) * height;
      const sr = (s % 3) * 0.8 + 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'neon_mesh') {
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, width, height);
    // Grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
    ctx.lineWidth = 1;
    const gridStep = 40;
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (theme === 'crt_vhs') {
    ctx.fillStyle = '#0c0d11';
    ctx.fillRect(0, 0, width, height);
    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 2);
    }
  } else {
    // Default dark slate
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}
