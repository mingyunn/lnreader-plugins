import { fetchText } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { load as loadCheerio } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

class AKKNovel implements Plugin.PluginBase {
  id = 'akknovel';
  name = 'AKKNovel';
  icon = 'src/en/akknovel/icon.png';
  site = 'https://www.akknovel.com';
  version = '1.0.4';

  filters = {
    status: {
      type: FilterTypes.Picker,
      label: 'Status',
      value: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: 'OnGoing', value: 'OnGoing' },
        { label: 'Completed', value: 'Completed' },
      ],
    },
    sort: {
      type: FilterTypes.Picker,
      label: 'Sort By',
      value: 'createdAt',
      options: [
        { label: 'Published At', value: 'createdAt' },
        { label: 'Updated At', value: 'updatedAt' },
      ],
    },
    order: {
      type: FilterTypes.Picker,
      label: 'Order',
      value: 'desc',
      options: [
        { label: 'Descending', value: 'desc' },
        { label: 'Ascending', value: 'asc' },
      ],
    },
  } satisfies Filters;

  // Helper function to ALWAYS return a clean relative path (e.g., "/series/novel-name")
  // This prevents the double "https://akknovel.com/https://akknovel.com/..." error
  private getPath(urlStr: string): string {
    if (!urlStr) return '';
    try {
      // If it's a full URL, extract just the pathname
      return new URL(urlStr).pathname;
    } catch {
      // If it's already a relative path, ensure it starts with '/'
      return urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
    }
  }

  async popularNovels(
    pageNo: number,
    options: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    // 1. Extract filter values
    const { status, sort, order } = options.filters;

    // 2. Build query parameters
    const query = new URLSearchParams();

    // Only add 'status' if it's not 'all' (to keep URLs clean, though 'all' works too)
    if (status.value !== 'all') {
      query.append('status', status.value);
    }

    // LNReader "Latest" button override
    if (options.showLatestNovels) {
      query.append('sort', 'updatedAt');
      query.append('order', 'desc');
    } else {
      query.append('sort', sort.value);
      query.append('order', order.value);
    }

    // 3. Construct the final URL with pagination and query string
    const queryString = query.toString();
    const url =
      pageNo > 1
        ? `${this.site}/series/page/${pageNo}/?${queryString}`
        : `${this.site}/series/?${queryString}`;

    // Fetch and parse the HTML
    const body = await fetchText(url);
    const $ = loadCheerio(body);
    const novels: Plugin.NovelItem[] = [];

    $('article.flex.items-start').each((i, el) => {
      const name = $(el).find('h2').text().trim();
      const cover = $(el).find('img').attr('src');
      const fullUrl = $(el).find('a').attr('href') || '';

      const path = this.getPath(fullUrl);

      if (name && path) {
        novels.push({ name, cover: cover || defaultCover, path });
      }
    });

    return novels;
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    // Safety check: if novelPath somehow already contains 'http', use it directly.
    // Otherwise, append it to this.site.
    const url = novelPath.startsWith('http')
      ? novelPath
      : this.site + this.getPath(novelPath);

    const body = await fetchText(url);
    const $ = loadCheerio(body);

    const novel: Plugin.SourceNovel = {
      path: this.getPath(novelPath), // Keep it clean for the app's database
      name: $('h1.font-semibold').first().text().trim() || 'Untitled',
      cover: $('img.object-cover').attr('src') || defaultCover,
      summary: $('.leading-7').first().text().trim(),
      chapters: [],
    };

    const statusText = $('.badge').text().trim().toLowerCase();
    if (statusText.includes('ongoing')) {
      novel.status = NovelStatus.Ongoing;
    } else if (statusText.includes('completed')) {
      novel.status = NovelStatus.Completed;
    } else {
      novel.status = NovelStatus.Unknown;
    }

    const chapters: Plugin.ChapterItem[] = [];
    $('#chapters .chapter-item a').each((i, el) => {
      const name = $(el).text().trim();
      const fullUrl = $(el).attr('href') || '';

      const path = this.getPath(fullUrl);

      if (name && path) {
        chapters.push({
          name,
          path,
          chapterNumber: i + 1,
        });
      }
    });

    novel.chapters = chapters;
    return novel;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const url = chapterPath.startsWith('http')
      ? chapterPath
      : this.site + this.getPath(chapterPath);
    const body = await fetchText(url);
    const $ = loadCheerio(body);

    // FIXED: Added #chapter-content to target the ID specifically
    const content = $(
      '#chapter-content, .chapter-content, #chapter-container',
    ).first();

    // Clean up unwanted elements like Google Ads, scripts, and iframes
    content.find('script, ins, iframe, .ads, .code-block, button').remove();

    return content.html() || '';
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const url =
      pageNo > 1
        ? `${this.site}/series/page/${pageNo}/?keyword=${encodeURIComponent(searchTerm)}`
        : `${this.site}/series/?keyword=${encodeURIComponent(searchTerm)}`;

    const body = await fetchText(url);
    const $ = loadCheerio(body);
    const novels: Plugin.NovelItem[] = [];

    $('article.flex.items-start').each((i, el) => {
      const name = $(el).find('h2').text().trim();
      const cover = $(el).find('img').attr('src');
      const fullUrl = $(el).find('a').attr('href') || '';

      const path = this.getPath(fullUrl);

      if (name && path) {
        novels.push({ name, cover: cover || defaultCover, path });
      }
    });

    return novels;
  }

  resolveUrl = (path: string) =>
    path.startsWith('http') ? path : this.site + this.getPath(path);
}

export default new AKKNovel();
