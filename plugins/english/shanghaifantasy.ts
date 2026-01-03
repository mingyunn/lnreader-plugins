import { fetchApi, fetchText } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { load as loadCheerio } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

type APINovel = {
  title?: string;
  post_title?: string;
  name?: string;
  novelImage?: string;
  thumbnail?: string;
  image?: string;
  permalink?: string;
  link?: string;
  url?: string;
  novelIntro?: string;
  novelGenres?: string;
  novelStat?: string;
  id?: number;
};

type APIChapter = {
  post_title?: string;
  title?: string;
  name?: string;
  permalink?: string;
  guid?: string;
  url?: string;
  link?: string;
  post_date?: string;
  date?: string;
};

class ShanghaiFantasy implements Plugin.PluginBase {
  id = 'shanghaifantasy';
  name = 'Shanghai Fantasy';
  icon = 'src/en/shanghaifantasy/icon.png';
  site = 'https://shanghaifantasy.com';
  version = '1.0.0';
  webStorageUtilized = false;

  filters = {
    novelstatus: {
      type: FilterTypes.Picker,
      label: 'Status',
      value: '',
      options: [
        { label: 'All', value: '' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Dropped', value: 'Dropped' },
        { label: 'Hiatus', value: 'Hiatus' },
        { label: 'Ongoing', value: 'Ongoing' },
      ],
    },
    term: {
      type: FilterTypes.Picker,
      label: 'Genre',
      value: '',
      options: [
        { label: 'All', value: '' },
        { label: '1960s', value: '1960s' },
        { label: '1970s', value: '1970s' },
        { label: '1970s Era', value: '1970s Era' },
        { label: '1980s', value: '1980s' },
        { label: '1990s', value: '1990s' },
        { label: '80s Setting', value: '80s Setting' },
        { label: 'Abandoned', value: 'Abandoned' },
        { label: 'Ability', value: 'Ability' },
        { label: 'ABO', value: 'ABO' },
        { label: 'Abstinent', value: 'Abstinent' },
        { label: 'Abstinent Pilot', value: 'Abstinent Pilot' },
        { label: 'Abuse', value: 'Abuse' },
        { label: 'Abusive Characters', value: 'Abusive Characters' },
        { label: 'Acting', value: 'Acting' },
        { label: 'Action', value: 'Action' },
        { label: 'adapted to drama', value: 'adapted to drama' },
        { label: 'Adorable Baby', value: 'Adorable Baby' },
        { label: 'Adult', value: 'Adult' },
        { label: 'Adventure', value: 'Adventure' },
        { label: 'Age Gap', value: 'Age Gap' },
        { label: 'Alternate History', value: 'Alternate History' },
        { label: 'Alternate World', value: 'Alternate World' },
        { label: 'Amnesia', value: 'Amnesia' },
        { label: 'Ancient China', value: 'Ancient China' },
        { label: 'Ancient Farming', value: 'Ancient Farming' },
        { label: 'ancient rom', value: 'ancient rom' },
        { label: 'Ancient Romance', value: 'Ancient Romance' },
        { label: 'ancient style', value: 'ancient style' },
        { label: 'Ancient Times', value: 'Ancient Times' },
        { label: 'Angst', value: 'Angst' },
        { label: 'Apocalypse', value: 'Apocalypse' },
        { label: 'Arranged Marriage', value: 'Arranged Marriage' },
        { label: 'Awakened', value: 'Awakened' },
        { label: 'Beastmen', value: 'Beastmen' },
        { label: 'Beautiful Female Lead', value: 'Beautiful Female Lead' },
        { label: 'Beautiful protagonist', value: 'Beautiful protagonist' },
        { label: 'beauty-obsessed', value: 'beauty-obsessed' },
        { label: 'being pampered', value: 'being pampered' },
        { label: 'Betrayed', value: 'Betrayed' },
        { label: 'Bickering Couple', value: 'Bickering Couple' },
        { label: 'Billionaire Romance', value: 'Billionaire Romance' },
        { label: 'BL', value: 'BL' },
        { label: 'Book Transmigration', value: 'Book Transmigration' },
        { label: 'Boy love', value: 'Boy love' },
        { label: 'Boys’ Love', value: 'Boys’ Love' },
        { label: 'Business management', value: 'Business management' },
        { label: 'business owner', value: 'business owner' },
        { label: 'Bussiness', value: 'Bussiness' },
        { label: 'campus romance', value: 'campus romance' },
        { label: 'Cannon Fodder', value: 'Cannon Fodder' },
        { label: 'Cat-like', value: 'Cat-like' },
        { label: 'celebrity', value: 'celebrity' },
        { label: 'CEO', value: 'CEO' },
        { label: 'CEO/Tycoon Romance', value: 'CEO/Tycoon Romance' },
        { label: 'Changing Fate', value: 'Changing Fate' },
        { label: 'Character Growth', value: 'Character Growth' },
        { label: 'Charming Protagonist', value: 'Charming Protagonist' },
        { label: 'Chef', value: 'Chef' },
        { label: 'Child-Rearing', value: 'Child-Rearing' },
        { label: 'Childbirth', value: 'Childbirth' },
        { label: 'Childcare', value: 'Childcare' },
        { label: 'Childhood Love', value: 'Childhood Love' },
        {
          label: 'Childless Military Young Master',
          value: 'Childless Military Young Master',
        },
        { label: 'Classical Fantasy', value: 'Classical Fantasy' },
        { label: 'Comedic Undertone', value: 'Comedic Undertone' },
        { label: 'Comedy', value: 'Comedy' },
        {
          label: 'Comical Misunderstandings',
          value: 'Comical Misunderstandings',
        },
        {
          label: 'Complex Family Relationships',
          value: 'Complex Family Relationships',
        },
        { label: 'Concubine', value: 'Concubine' },
        { label: 'Consort', value: 'Consort' },
        { label: 'Contemporary Romance', value: 'Contemporary Romance' },
        {
          label: 'Contractual Relationship',
          value: 'Contractual Relationship',
        },
        { label: 'Cooking', value: 'Cooking' },
        { label: 'Countryside', value: 'Countryside' },
        { label: 'Court Nobility', value: 'Court Nobility' },
        { label: 'Crime', value: 'Crime' },
        { label: 'Crime Investigation', value: 'Crime Investigation' },
        { label: 'Cross-Dressing', value: 'Cross-Dressing' },
        { label: 'Crossing', value: 'Crossing' },
        {
          label: 'Culinary business management',
          value: 'Culinary business management',
        },
        { label: 'Cultivation', value: 'Cultivation' },
        { label: 'cute baby', value: 'cute baby' },
        { label: 'Cute Child', value: 'Cute Child' },
        { label: 'Cute Children', value: 'Cute Children' },
        { label: 'Cute Kids', value: 'Cute Kids' },
        { label: 'Cute Protagonist', value: 'Cute Protagonist' },
        { label: 'Daily Life', value: 'Daily Life' },
        { label: 'Dark scheming Top', value: 'Dark scheming Top' },
        { label: 'Death', value: 'Death' },
        { label: 'Delicate Girl', value: 'Delicate Girl' },
        { label: 'Devoted Couple', value: 'Devoted Couple' },
        { label: 'Dimension', value: 'Dimension' },
        { label: 'Dimensional Space', value: 'Dimensional Space' },
        { label: 'domestic drama', value: 'domestic drama' },
        { label: 'Domestic Life', value: 'Domestic Life' },
        {
          label: 'Domestic Power Struggles',
          value: 'Domestic Power Struggles',
        },
        { label: 'Doting Husband', value: 'Doting Husband' },
        { label: 'Doting Love Interest', value: 'Doting Love Interest' },
        { label: 'Double Clean', value: 'Double Clean' },
        { label: 'Double Purity', value: 'Double Purity' },
        { label: 'Drama', value: 'Drama' },
        { label: 'Dream', value: 'Dream' },
        { label: 'Dual Male Leads', value: 'Dual Male Leads' },
        { label: 'Dungeon', value: 'Dungeon' },
        { label: 'Ecchi', value: 'Ecchi' },
        { label: 'Empire', value: 'Empire' },
        { label: 'Enemies-to-Lovers', value: 'Enemies-to-Lovers' },
        { label: 'Entertainment', value: 'Entertainment' },
        { label: 'Entertainment Industry', value: 'Entertainment Industry' },
        { label: 'Era', value: 'Era' },
        { label: 'Era Farming', value: 'Era Farming' },
        { label: 'Era Fiction', value: 'Era Fiction' },
        { label: 'Era novel', value: 'Era novel' },
        { label: 'Escape', value: 'Escape' },
        { label: 'Exile', value: 'Exile' },
        {
          label: 'Extremely Beautiful Female Lead',
          value: 'Extremely Beautiful Female Lead',
        },
        { label: 'Face-Slapping', value: 'Face-Slapping' },
        { label: 'Fake Heiress', value: 'Fake Heiress' },
        { label: 'Fallen Nobles', value: 'Fallen Nobles' },
        { label: 'Familial Love', value: 'Familial Love' },
        { label: 'Family', value: 'Family' },
        { label: 'Family Betrayal', value: 'Family Betrayal' },
        { label: 'Family Bonds', value: 'Family Bonds' },
        { label: 'Family conflict', value: 'Family conflict' },
        { label: 'Family Doting', value: 'Family Doting' },
        { label: 'Family Drama', value: 'Family Drama' },
        { label: 'Family Life', value: 'Family Life' },
        { label: 'family oriented', value: 'family oriented' },
        { label: 'family/parenting', value: 'family/parenting' },
        { label: 'Fanfiction', value: 'Fanfiction' },
        { label: 'Fantasy', value: 'Fantasy' },
        { label: 'Fantasy Romance', value: 'Fantasy Romance' },
        { label: 'Farming', value: 'Farming' },
        { label: 'farming capabilities', value: 'farming capabilities' },
        { label: 'Farming life', value: 'Farming life' },
        { label: 'Female General', value: 'Female General' },
        { label: 'Female Lead', value: 'Female Lead' },
        { label: 'Female Protagonist', value: 'Female Protagonist' },
        { label: 'Female Speculator', value: 'Female Speculator' },
        { label: 'Flash Marriage', value: 'Flash Marriage' },
        { label: 'Flirtation', value: 'Flirtation' },
        { label: 'Food', value: 'Food' },
        {
          label: 'Foraging in the Mountains and Sea',
          value: 'Foraging in the Mountains and Sea',
        },
        { label: 'Forced Marriage', value: 'Forced Marriage' },
        { label: 'Framed', value: 'Framed' },
        { label: 'Free Love', value: 'Free Love' },
        { label: 'FREE NOVEL‼️', value: 'FREE NOVEL‼️' },
        { label: 'future knowledge', value: 'future knowledge' },
        { label: 'Game', value: 'Game' },
        { label: 'Game World', value: 'Game World' },
        { label: 'Gender Bender', value: 'Gender Bender' },
        { label: 'Getting Rich', value: 'Getting Rich' },
        { label: 'Ghost', value: 'Ghost' },
        {
          label: 'Gloomy Villain with Skin Hunger',
          value: 'Gloomy Villain with Skin Hunger',
        },
        { label: 'Good Pregnancy System', value: 'Good Pregnancy System' },
        { label: 'Gourmet Food', value: 'Gourmet Food' },
        { label: 'Green Tea', value: 'Green Tea' },
        { label: 'handsome male lead', value: 'handsome male lead' },
        { label: 'Harem', value: 'Harem' },
        { label: 'HE', value: 'HE' },
        { label: 'Heartwarming', value: 'Heartwarming' },
        { label: 'heiress story', value: 'heiress story' },
        { label: 'Hidden Identity', value: 'Hidden Identity' },
        { label: 'Hidden Marriage', value: 'Hidden Marriage' },
        { label: 'Historical', value: 'Historical' },
        { label: 'Historical Fiction', value: 'Historical Fiction' },
        { label: 'Historical Romance', value: 'Historical Romance' },
        { label: 'Hoarding', value: 'Hoarding' },
        { label: 'Horror', value: 'Horror' },
        { label: 'Household Infighting', value: 'Household Infighting' },
        { label: 'Inner Thoughts', value: 'Inner Thoughts' },
        { label: 'Interstellar', value: 'Interstellar' },
        { label: 'Isekai', value: 'Isekai' },
        { label: 'Josei', value: 'Josei' },
        { label: 'Lazy', value: 'Lazy' },
        { label: 'light fantasy', value: 'light fantasy' },
        { label: 'Light-hearted', value: 'Light-hearted' },
        { label: 'Lighthearted', value: 'Lighthearted' },
        { label: 'Livestream', value: 'Livestream' },
        { label: 'livestreaming', value: 'livestreaming' },
        { label: 'love', value: 'love' },
        { label: 'Love After Marriage', value: 'Love After Marriage' },
        { label: 'love at first sight', value: 'love at first sight' },
        { label: 'Love Obsession', value: 'Love Obsession' },
        { label: 'Low Profile', value: 'Low Profile' },
        { label: 'Lucky Protagonist', value: 'Lucky Protagonist' },
        { label: 'magical space', value: 'magical space' },
        { label: 'Maid', value: 'Maid' },
        { label: 'male lead', value: 'male lead' },
        { label: 'Male Protagonist', value: 'Male Protagonist' },
        { label: 'Marriage', value: 'Marriage' },
        { label: 'Marriage Before Love', value: 'Marriage Before Love' },
        {
          label: 'Marriage First Love Later',
          value: 'Marriage First Love Later',
        },
        { label: 'marriage of convenience', value: 'marriage of convenience' },
        { label: 'Martial Arts', value: 'Martial Arts' },
        {
          label: 'masochistic Crown Prince',
          value: 'masochistic Crown Prince',
        },
        { label: 'Match Made in Heaven', value: 'Match Made in Heaven' },
        { label: 'Mature', value: 'Mature' },
        { label: 'Mecha', value: 'Mecha' },
        { label: 'medical genius', value: 'medical genius' },
        { label: 'medical skills', value: 'medical skills' },
        { label: 'Metaphysics', value: 'Metaphysics' },
        { label: 'Military', value: 'Military' },
        { label: 'Military Husband', value: 'Military Husband' },
        { label: 'Military Marriage', value: 'Military Marriage' },
        { label: 'Military Romance', value: 'Military Romance' },
        { label: 'Military Wife', value: 'Military Wife' },
        { label: 'mind reading', value: 'mind reading' },
        { label: 'Mistake', value: 'Mistake' },
        { label: 'Modern', value: 'Modern' },
        { label: 'Modern Day', value: 'Modern Day' },
        { label: 'Modern Romance', value: 'Modern Romance' },
        { label: 'Modern Setting', value: 'Modern Setting' },
        { label: 'Modern/Contemporary', value: 'Modern/Contemporary' },
        { label: 'Mother', value: 'Mother' },
        { label: 'Mpreg', value: 'Mpreg' },
        { label: 'Mystery', value: 'Mystery' },
        { label: 'Mythical Beasts', value: 'Mythical Beasts' },
        { label: 'Naive Bottom', value: 'Naive Bottom' },
        { label: 'Natural Disasters', value: 'Natural Disasters' },
        { label: 'Near-Death Experience', value: 'Near-Death Experience' },
        { label: 'Noble', value: 'Noble' },
        { label: 'Novel', value: 'Novel' },
        { label: 'Obsessive love', value: 'Obsessive love' },
        { label: 'Older Love Interests', value: 'Older Love Interests' },
        { label: 'omegaverse', value: 'omegaverse' },
        { label: 'One True Love', value: 'One True Love' },
        { label: 'One-Night Stand', value: 'One-Night Stand' },
        {
          label: 'One-Night Stand to Marriage',
          value: 'One-Night Stand to Marriage',
        },
        { label: 'palace fighting', value: 'palace fighting' },
        { label: 'Palace Intrigue', value: 'Palace Intrigue' },
        { label: 'Pampering Wife', value: 'Pampering Wife' },
        { label: 'Parallel World', value: 'Parallel World' },
        { label: 'Period Novel', value: 'Period Novel' },
        { label: 'Plot Twist', value: 'Plot Twist' },
        { label: 'Political Intrigue', value: 'Political Intrigue' },
        { label: 'Poor Protagonist', value: 'Poor Protagonist' },
        { label: 'Poor to rich', value: 'Poor to rich' },
        { label: 'Power Couple', value: 'Power Couple' },
        { label: 'Power Dynamics', value: 'Power Dynamics' },
        { label: 'Power Fantasy', value: 'Power Fantasy' },
        { label: 'powerful physique', value: 'powerful physique' },
        { label: 'pregnancy', value: 'pregnancy' },
        { label: 'Premonition', value: 'Premonition' },
        { label: 'Prince', value: 'Prince' },
        { label: 'Psychological', value: 'Psychological' },
        { label: 'published novel', value: 'published novel' },
        { label: 'Quick transmigration', value: 'Quick transmigration' },
        { label: 'raising a baby', value: 'raising a baby' },
        { label: 'Rebirth', value: 'Rebirth' },
        {
          label: 'Rebirth on Douluo Continent',
          value: 'Rebirth on Douluo Continent',
        },
        { label: 'Reborn', value: 'Reborn' },
        {
          label: 'Reborn Supporting Female Character',
          value: 'Reborn Supporting Female Character',
        },
        { label: 'Redemption', value: 'Redemption' },
        { label: 'reincarnation', value: 'reincarnation' },
        { label: 'Revenge', value: 'Revenge' },
        { label: 'Revenge on Scum', value: 'Revenge on Scum' },
        { label: 'Reversal of Fortune', value: 'Reversal of Fortune' },
        {
          label: 'Revitalizing the Nation through Scientific Research',
          value: 'Revitalizing the Nation through Scientific Research',
        },
        { label: 'Rich CEO', value: 'Rich CEO' },
        { label: 'Rich Family', value: 'Rich Family' },
        { label: 'Romance', value: 'Romance' },
        { label: 'Romance Comedy', value: 'Romance Comedy' },
        { label: 'Romance Reality Show', value: 'Romance Reality Show' },
        { label: 'Romantic Comedy', value: 'Romantic Comedy' },
        { label: 'Romantic Drama', value: 'Romantic Drama' },
        { label: 'Rough Man Male Lead', value: 'Rough Man Male Lead' },
        { label: 'Royal Family', value: 'Royal Family' },
        { label: 'Royalty', value: 'Royalty' },
        { label: 'Rural', value: 'Rural' },
        { label: 'Rural life', value: 'Rural life' },
        {
          label: 'Ruthless Revenge on Scum',
          value: 'Ruthless Revenge on Scum',
        },
        { label: 'Sacrificed', value: 'Sacrificed' },
        { label: 'sadomasochism', value: 'sadomasochism' },
        { label: 'SameSexMarriage', value: 'SameSexMarriage' },
        { label: 'Savior', value: 'Savior' },
        {
          label: 'Schemes and Conspiracies',
          value: 'Schemes and Conspiracies',
        },
        { label: 'Scheming Female Lead', value: 'Scheming Female Lead' },
        { label: 'School Life', value: 'School Life' },
        { label: 'Sci-fi', value: 'Sci-fi' },
        { label: 'Second Chance', value: 'Second Chance' },
        { label: 'Secret Crush', value: 'Secret Crush' },
        { label: 'Secret Identity', value: 'Secret Identity' },
        { label: 'Seduction', value: 'Seduction' },
        { label: 'seinen', value: 'seinen' },
        { label: 'Short Story', value: 'Short Story' },
        { label: 'Shoujo', value: 'Shoujo' },
        { label: 'Shoujo Ai', value: 'Shoujo Ai' },
        { label: 'Shounen', value: 'Shounen' },
        { label: 'Shounen Ai', value: 'Shounen Ai' },
        { label: 'Showbiz', value: 'Showbiz' },
        { label: 'Sick Husband', value: 'Sick Husband' },
        { label: 'Slapping Faces', value: 'Slapping Faces' },
        { label: 'Slice of Life', value: 'Slice of Life' },
        { label: 'Slow Burn', value: 'Slow Burn' },
        { label: 'slow romance', value: 'slow romance' },
        { label: 'Slow-burn Romance', value: 'Slow-burn Romance' },
        { label: 'Slow-paced', value: 'Slow-paced' },
        { label: 'Smut', value: 'Smut' },
        { label: 'Space', value: 'Space' },
        { label: 'Space Ability', value: 'Space Ability' },
        { label: 'Space for Stockpiling', value: 'Space for Stockpiling' },
        { label: 'Space Hoarding', value: 'Space Hoarding' },
        { label: 'Spirit Spring', value: 'Spirit Spring' },
        { label: 'Spoiled', value: 'Spoiled' },
        { label: 'Spoiled Wife', value: 'Spoiled Wife' },
        { label: 'Sports', value: 'Sports' },
        { label: 'Steamy Romance', value: 'Steamy Romance' },
        { label: 'Stepson', value: 'Stepson' },
        { label: 'Strong Female Lead', value: 'Strong Female Lead' },
        { label: 'Strong Love Interest', value: 'Strong Love Interest' },
        { label: 'Strong Possessiveness', value: 'Strong Possessiveness' },
        { label: 'Strong Protagonist', value: 'Strong Protagonist' },
        { label: 'Substitute Marriage', value: 'Substitute Marriage' },
        { label: 'Super Strong', value: 'Super Strong' },
        { label: 'Supernatural', value: 'Supernatural' },
        { label: 'Superpowers', value: 'Superpowers' },
        { label: 'supporting characters', value: 'supporting characters' },
        {
          label: 'Supporting Female Character',
          value: 'Supporting Female Character',
        },
        { label: 'Survival', value: 'Survival' },
        { label: 'Suspense', value: 'Suspense' },
        { label: 'Sweet', value: 'Sweet' },
        { label: 'Sweet After Angst', value: 'Sweet After Angst' },
        { label: 'Sweet Doting', value: 'Sweet Doting' },
        { label: 'Sweet Love', value: 'Sweet Love' },
        { label: 'Sweet Pampering', value: 'Sweet Pampering' },
        { label: 'sweet pet', value: 'sweet pet' },
        { label: 'Sweet Revenge', value: 'Sweet Revenge' },
        { label: 'Sweet Romance', value: 'Sweet Romance' },
        { label: 'Sweet Story', value: 'Sweet Story' },
        { label: 'SweetNovel', value: 'SweetNovel' },
        { label: 'system', value: 'system' },
        { label: 'Taken Over', value: 'Taken Over' },
        { label: 'Thriller', value: 'Thriller' },
        { label: 'Time Reverse Ability', value: 'Time Reverse Ability' },
        { label: 'Time Travel', value: 'Time Travel' },
        { label: "Time travel to 70's", value: "Time travel to 70's" },
        { label: 'Tragedy', value: 'Tragedy' },
        { label: 'Tragic Past', value: 'Tragic Past' },
        { label: 'Traitor', value: 'Traitor' },
        { label: 'Transformation', value: 'Transformation' },
        { label: 'transmigrated', value: 'transmigrated' },
        { label: 'Transmigration', value: 'Transmigration' },
        {
          label: 'Transmigration into a Book',
          value: 'Transmigration into a Book',
        },
        {
          label: 'transmigration into a novel',
          value: 'transmigration into a novel',
        },
        {
          label: 'Transmigration into Books',
          value: 'Transmigration into Books',
        },
        { label: 'Traveling through space', value: 'Traveling through space' },
        { label: 'Traveling through time', value: 'Traveling through time' },
        { label: 'True Heiress', value: 'True Heiress' },
        { label: 'Unfair Death', value: 'Unfair Death' },
        { label: 'Unique Romance', value: 'Unique Romance' },
        { label: 'Unlimited Flow', value: 'Unlimited Flow' },
        { label: 'Unrequited Love', value: 'Unrequited Love' },
        { label: 'Urban', value: 'Urban' },
        { label: 'urban life', value: 'urban life' },
        { label: 'Urban Romance', value: 'Urban Romance' },
        { label: 'Village Life', value: 'Village Life' },
        { label: 'Villain', value: 'Villain' },
        { label: 'War', value: 'War' },
        { label: 'Weak to Strong', value: 'Weak to Strong' },
        { label: 'Wealth Accumulation', value: 'Wealth Accumulation' },
        {
          label: 'Wealthy Aristocratic Families',
          value: 'Wealthy Aristocratic Families',
        },
        { label: 'wealthy characters', value: 'wealthy characters' },
        { label: 'Wealthy Family', value: 'Wealthy Family' },
        { label: 'Wife-Chasing Romance', value: 'Wife-Chasing Romance' },
        { label: 'Wish Fulfillment Novel', value: 'Wish Fulfillment Novel' },
        {
          label: 'wisted Real vs. Fake Daughter Trope',
          value: 'wisted Real vs. Fake Daughter Trope',
        },
        { label: 'Wrong wedding chamber', value: 'Wrong wedding chamber' },
        { label: 'Wuxia', value: 'Wuxia' },
        { label: 'Xianxia', value: 'Xianxia' },
        { label: 'Xuanhuan', value: 'Xuanhuan' },
        { label: 'yandere', value: 'yandere' },
        { label: 'Yaoi', value: 'Yaoi' },
        { label: 'Younger Love Interest', value: 'Younger Love Interest' },
        { label: 'Yuri', value: 'Yuri' },
        { label: 'Zombie', value: 'Zombie' },
        {
          label: '🔓 Completely Unlocked 🔓',
          value: '🔓 Completely Unlocked 🔓',
        },
      ],
    },
  } satisfies Filters;

  private getNovelId(html: string): string | null {
    const dataCatMatch = html.match(/data-cat=["'](\d+)["']/);
    if (dataCatMatch) return dataCatMatch[1];

    const shortlinkMatch = html.match(/[?&]p=(\d+)/);
    if (shortlinkMatch) return shortlinkMatch[1];

    return null;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').trim();
  }

  async popularNovels(
    pageNo: number,
    // Change <Filters> to <typeof this.filters>
    options: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const novels: Plugin.NovelItem[] = [];
    const apiUrl = `${this.site}/wp-json/fiction/v1/novels/`;

    // TypeScript now knows novelstatus.value is a string!
    const { novelstatus, term } = options.filters;

    const params = new URLSearchParams();
    params.append('page', pageNo.toString());
    params.append('novelstatus', novelstatus?.value || '');
    params.append('term', term?.value || '');
    params.append('orderby', 'date');
    params.append('order', 'desc');
    params.append('query', '');

    try {
      const response = await fetchApi(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Referer': `${this.site}/library/?pages=${pageNo}`,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const data = await response.json();
      const list = (Array.isArray(data) ? data : data.data || []) as APINovel[];

      list.forEach(novel => {
        if (novel.title) {
          novels.push({
            name: novel.title,
            cover: novel.novelImage || novel.thumbnail || defaultCover,
            path: (novel.permalink || '').replace(this.site, ''),
          });
        }
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('ShanghaiFantasy Popular Error:', e.message);
      }
    }

    return novels;
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const url = this.site + novelPath;
    const body = await fetchText(url);
    const $ = loadCheerio(body);

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name: 'Untitled',
      cover: defaultCover,
      status: NovelStatus.Unknown,
      chapters: [],
    };

    novel.name =
      $('p.text-lg.font-bold').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      'Untitled';

    const coverUrl = $('img.rounded-lg, img.aspect-\\[3\\/4\\]').attr('src');
    if (coverUrl) novel.cover = coverUrl;

    $('span.font-bold').each((i, el) => {
      const label = $(el).text().trim();
      const value = $(el).parent().text().replace(label, '').trim();

      if (label.includes('Author')) novel.author = value;
    });

    const statusText = $('a[href*="status"]').text().trim().toLowerCase();
    if (statusText.includes('ongoing')) novel.status = NovelStatus.Ongoing;
    else if (statusText.includes('completed'))
      novel.status = NovelStatus.Completed;
    else if (statusText.includes('hiatus')) novel.status = NovelStatus.OnHiatus;

    const genres: string[] = [];
    $('a[href*="genre"]').each((i, el) => {
      genres.push($(el).text().trim());
    });
    if (genres.length > 0) novel.genres = genres.join(', ');

    const summaryDiv = $('div[x-show="activeTab===\'Synopsis\'"]');
    if (summaryDiv.length > 0) {
      novel.summary = summaryDiv
        .find('p')
        .map((i, el) => $(el).text().trim())
        .get()
        .join('\n\n');
    } else {
      novel.summary =
        $('meta[property="og:description"]').attr('content') || '';
    }

    const novelId = this.getNovelId(body);

    if (novelId) {
      const chapterApiUrl = `${this.site}/wp-json/fiction/v1/chapters`;
      const params = new URLSearchParams();
      params.append('category', novelId);
      params.append('order', 'asc');
      params.append('page', '1');
      params.append('per_page', '9999');

      try {
        const response = await fetchApi(
          `${chapterApiUrl}?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Referer': url,
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          },
        );

        const data = await response.json();
        const chapterList = (
          Array.isArray(data) ? data : data.data || []
        ) as APIChapter[];

        if (chapterList.length > 0) {
          novel.chapters = [];
          chapterList.forEach((chap, index) => {
            const title =
              chap.post_title || chap.title || `Chapter ${index + 1}`;
            const link = chap.permalink || chap.url || chap.link;
            const date = chap.post_date || chap.date || '';

            if (link) {
              novel.chapters?.push({
                name: title,
                path: link.replace(this.site, ''),
                chapterNumber: index + 1,
                releaseTime: date,
              });
            }
          });
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error('ShanghaiFantasy Chapter API Error:', e.message);
        }
      }
    }

    return novel;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const url = this.site + chapterPath;
    const body = await fetchText(url);
    const $ = loadCheerio(body);

    const contentDiv = $('.contenta, .entry-content, .reading-content').first();

    contentDiv
      .find('.ai-viewport-1, .ai-viewport-2, .ai-viewport-3, .code-block')
      .remove();
    contentDiv.find('script, ins, button, template, div[x-data]').remove();

    return contentDiv.html() || '';
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const novels: Plugin.NovelItem[] = [];
    const apiUrl = `${this.site}/wp-json/fiction/v1/novels/`;

    const params = new URLSearchParams();
    params.append('page', pageNo.toString());
    params.append('novelstatus', '');
    params.append('term', '');
    params.append('query', searchTerm);
    params.append('orderby', '');
    params.append('order', '');

    try {
      const response = await fetchApi(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Referer': `${this.site}/library/`,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const data = await response.json();
      const list = (Array.isArray(data) ? data : data.data || []) as APINovel[];

      list.forEach(novel => {
        const title = novel.title || novel.post_title || novel.name;
        const cover =
          novel.novelImage || novel.thumbnail || novel.image || defaultCover;
        const link = novel.permalink || novel.link || novel.url;

        if (title && link) {
          novels.push({
            name: title,
            cover: cover,
            path: link.replace(this.site, ''),
          });
        }
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('ShanghaiFantasy Search Error:', e.message);
      }
    }

    return novels;
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new ShanghaiFantasy();
