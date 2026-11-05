import { fetchText } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { load as loadCheerio, CheerioAPI } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

class WTNovels implements Plugin.PluginBase {
  id = 'wtnovels';
  name = 'WTNovels';
  icon = 'src/en/wtnovels/icon.png';
  site = 'https://www.wtnovels.com';
  version = '1.0.1';

  filters = {
    genre: {
      type: FilterTypes.CheckboxGroup,
      label: 'Genre',
      value: [],
      options: [
        { label: 'Action', value: 'action' },
        { label: 'Adult', value: 'adult' },
        { label: 'Adventure', value: 'adventure' },
        { label: 'Comedy', value: 'comedy' },
        { label: 'Drama', value: 'drama' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Gender Bender', value: 'gender-bender' },
        { label: 'Harem', value: 'harem' },
        { label: 'Historical', value: 'historical' },
        { label: 'Josei', value: 'josei' },
        { label: 'Martial Arts', value: 'martial-arts' },
        { label: 'Mature', value: 'mature' },
        { label: 'Mecha', value: 'mecha' },
        { label: 'Mystery', value: 'mystery' },
        { label: 'Psychological', value: 'psychological' },
        { label: 'Romance', value: 'romance' },
        { label: 'Satire', value: 'satire' },
        { label: 'School Life', value: 'school-of-life' },
        { label: 'Sci-fi', value: 'sci-fi' },
        { label: 'Shounen Ai', value: 'shounen-ai' },
        { label: 'Slice of Life', value: 'slice-of-life' },
        { label: 'Supernatural', value: 'supernatural' },
        { label: 'Tragedy', value: 'tragedy' },
        { label: 'Urban', value: 'urban' },
        { label: 'Wuxia', value: 'wuxia' },
        { label: 'Xianxia', value: 'xianxia' },
        { label: 'Xuanhuan', value: 'xuanhuan' },
        { label: 'Yaoi', value: 'yaoi' },
      ],
    },
    status: {
      type: FilterTypes.Picker,
      label: 'Status',
      value: '',
      options: [
        { label: 'All', value: '' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Hiatus', value: 'hiatus' },
      ],
    },
    novel_type: {
      type: FilterTypes.Picker,
      label: 'Free / Paid',
      value: '',
      options: [
        { label: 'All', value: '' },
        { label: 'Free', value: 'free' },
        { label: 'Paid', value: 'paid' },
      ],
    },
    availability: {
      type: FilterTypes.Picker,
      label: 'PDF/EPUB Available',
      value: '',
      options: [
        { label: 'All', value: '' },
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
    },
    sort: {
      type: FilterTypes.Picker,
      label: 'Sort',
      value: '',
      options: [
        { label: 'New Novels', value: '' },
        { label: 'Updated At', value: 'latest' },
        { label: 'Published At', value: 'name' },
      ],
    },
    order: {
      type: FilterTypes.Picker,
      label: 'Order',
      value: '',
      options: [
        { label: 'Descending', value: '' },
        { label: 'Ascending', value: 'ASC' },
      ],
    },
  } satisfies Filters;

  // Always return a clean relative path like "/novels/the-strongest-healer/"
  private getPath(urlStr: string): string {
    if (!urlStr) return '';
    try {
      return new URL(urlStr).pathname;
    } catch {
      return urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
    }
  }

  private toUrl(path: string): string {
    return path.startsWith('http') ? path : this.site + this.getPath(path);
  }

  // Parses novel cards from browse/search pages.
  // Only reads the grid panel so the hidden list panel doesn't create duplicates.
  private parseNovelCards($: CheerioAPI): Plugin.NovelItem[] {
    const novels: Plugin.NovelItem[] = [];
    const seen = new Set<string>();

    let cards = $('.wtnf-browse-grid article.wtnf-card');
    if (!cards.length)
      cards = $('article.wtnf-card, article.wtnf-browse-list-card');

    cards.each((_, el) => {
      const card = $(el);
      const link = card.find('h3 a').first();
      const name = link.text().trim();
      const path = this.getPath(
        link.attr('href') || card.find('a').first().attr('href') || '',
      );
      const img = card.find('img').first();
      const cover = img.attr('data-src') || img.attr('src') || defaultCover;

      if (name && path && !seen.has(path)) {
        seen.add(path);
        novels.push({ name, cover, path });
      }
    });

    return novels;
  }

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const query = new URLSearchParams();

    if (filters.genre.value.length)
      query.append('genre', filters.genre.value.join(','));
    if (filters.status.value) query.append('status', filters.status.value);
    if (filters.novel_type.value)
      query.append('novel_type', filters.novel_type.value);
    if (filters.availability.value)
      query.append('availability', filters.availability.value);

    if (showLatestNovels) {
      query.append('sort', 'latest');
    } else {
      if (filters.sort.value) query.append('sort', filters.sort.value);
      if (filters.order.value) query.append('order', filters.order.value);
    }

    const qs = query.toString();
    const base =
      pageNo > 1
        ? `${this.site}/novels/page/${pageNo}/`
        : `${this.site}/novels/`;
    const url = qs ? `${base}?${qs}` : base;

    const body = await fetchText(url);
    return this.parseNovelCards(loadCheerio(body));
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const path = this.getPath(novelPath).replace(/\/?$/, '/');
    const $ = loadCheerio(await fetchText(this.toUrl(path)));

    const novel: Plugin.SourceNovel = {
      path,
      name:
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content')?.trim() ||
        'Untitled',
      cover:
        $('meta[property="og:image"]').attr('content') ||
        $('img[src*="/covers/"]').first().attr('src') ||
        defaultCover,
      chapters: [],
    };

    const summary =
      $(
        '.wtnf-novel-synopsis, .wtapp-novel-synopsis, .wtnf-novel__summary, [class*="synopsis"], [class*="description"]',
      )
        .first()
        .text()
        .trim() || $('meta[property="og:description"]').attr('content')?.trim();
    if (summary) novel.summary = summary;

    const author = $('[class*="author"] a, [class*="author"]')
      .first()
      .text()
      .trim();
    if (author) novel.author = author.replace(/^author:?\s*/i, '');

    const genres = $('a[href*="genre"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    if (genres.length)
      novel.genres = genres
        .filter((g, i) => genres.indexOf(g) === i)
        .join(', ');

    const statusText = $('.wtnf-novel-status')
      .first()
      .text()
      .trim()
      .toLowerCase();
    if (statusText.includes('ongoing')) novel.status = NovelStatus.Ongoing;
    else if (statusText.includes('completed'))
      novel.status = NovelStatus.Completed;
    else if (statusText.includes('hiatus')) novel.status = NovelStatus.OnHiatus;
    else novel.status = NovelStatus.Unknown;

    novel.chapters = await this.fetchChapters(path);
    return novel;
  }

  // Chapters live on /novels/<slug>/chapters/. Follows pagination if the site ever adds it.
  private async fetchChapters(
    novelPath: string,
  ): Promise<Plugin.ChapterItem[]> {
    const chapters: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();
    let url: string | undefined = `${this.site}${novelPath}chapters/`;
    let guard = 0;

    while (url && guard++ < 50) {
      const $ = loadCheerio(await fetchText(url));

      $('.wtapp-novel-chapter-card a.wtapp-novel-chapter-card__row').each(
        (_, el) => {
          const link = $(el);
          const path = this.getPath(link.attr('href') || '');
          const name =
            link.find('.wtapp-novel-chapter-card__title').text().trim() ||
            link.text().trim();
          if (!name || !path || seen.has(path)) return;
          seen.add(path);

          const num = name.match(/chapter\s*(\d+(?:\.\d+)?)/i);
          chapters.push({
            name,
            path,
            chapterNumber: num ? parseFloat(num[1]) : chapters.length + 1,
          });
        },
      );

      const next = $('.wtnf-browse-pagination a.wtnf-browse-page--step')
        .filter((_, el) => /next/i.test($(el).text()))
        .attr('href');
      url = next ? this.toUrl(next) : undefined;
    }

    return chapters;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const $ = loadCheerio(await fetchText(this.toUrl(chapterPath)));
    const content = $('.wtapp-reader-prose, [data-wtapp-reader-prose]').first();

    content
      .find('script, style, ins, iframe, button, .ads, .code-block')
      .remove();

    // The site wraps text in <span>s and sometimes splits one sentence across
    // several <p> or <br>. Unwrap the spans, turn stray <br>/newlines into
    // spaces, then join paragraphs that were cut off mid-sentence.
    content.find('span').each((_, el) => {
      $(el).replaceWith($(el).html() || '');
    });
    content.find('br').replaceWith(' ');

    const blocks = content.children('p, div').length
      ? content.children('p, div')
      : content.find('p');

    const paragraphs: string[] = [];
    // A paragraph is complete if it ends with sentence punctuation, closing quotes or a dash
    const endsSentence = /[.!?…:;~)\]"'”’」』—–-]$/;

    blocks.each((_, el) => {
      const html = ($(el).html() || '').replace(/\s+/g, ' ').trim();
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text) return;

      const prev = paragraphs.length ? paragraphs[paragraphs.length - 1] : null;
      const prevText = prev ? loadCheerio(prev).text().trim() : '';

      if (prev && prevText && !endsSentence.test(prevText)) {
        paragraphs[paragraphs.length - 1] = `${prev} ${html}`;
      } else {
        paragraphs.push(html);
      }
    });

    if (!paragraphs.length) return content.html() || '';
    return paragraphs.map(p => `<p>${p}</p>`).join('\n');
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const term = encodeURIComponent(searchTerm);
    const url =
      pageNo > 1
        ? `${this.site}/search/page/${pageNo}/?s=${term}`
        : `${this.site}/search/?s=${term}`;

    const body = await fetchText(url);
    return this.parseNovelCards(loadCheerio(body));
  }

  resolveUrl = (path: string) => this.toUrl(path);
}

export default new WTNovels();
