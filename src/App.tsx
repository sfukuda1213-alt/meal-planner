import { useState, useMemo, useEffect } from "react";
import "./styles.css";

// --- アイコンコンポーネント ---
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 6h20M2 18h20"/></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;

// --- 型定義 ---
type Ingredient = {
  item: string;
  amount: number;
  unit: string;
  category: string;
};

type Recipe = {
  name: string;
  genre: "和食" | "洋食" | "中華" | "その他";
  ingredients: Ingredient[];
  steps: string[];
};

type WeeklyMeal = {
  day: string;
  recipe: Recipe;
  completed: boolean;
};

// --- レシピデータ (全40種類) ---
const recipePool: Recipe[] = [
  // 和食
  { name: "鶏もも肉の照り焼き", genre: "和食", ingredients: [{ item: "鶏もも肉", amount: 250, unit: "g", category: "肉" }, { item: "醤油", amount: 2, unit: "大さじ", category: "調味料" }, { item: "みりん", amount: 2, unit: "大さじ", category: "調味料" }], steps: ["鶏肉に片栗粉をまぶす。", "フライパンで皮目から焼く。", "醤油、みりん、酒、砂糖を混ぜたタレを絡める。"] },
  { name: "豚の生姜焼き", genre: "和食", ingredients: [{ item: "豚ロース肉", amount: 200, unit: "g", category: "肉" }, { item: "生姜", amount: 1, unit: "かけ", category: "野菜" }, { item: "玉ねぎ", amount: 0.5, unit: "個", category: "野菜" }], steps: ["玉ねぎは薄切り、生姜はすりおろす。", "豚肉を炒め、色が変わったら玉ねぎを加える。", "醤油、みりん、酒、生姜を加えて炒め合わせる。"] },
  { name: "鯖の味噌煮", genre: "和食", ingredients: [{ item: "鯖", amount: 2, unit: "切れ", category: "魚" }, { item: "味噌", amount: 3, unit: "大さじ", category: "調味料" }, { item: "生姜", amount: 1, unit: "かけ", category: "野菜" }], steps: ["鯖は湯通しする。", "鍋に水、酒、砂糖、生姜を入れて煮立て、鯖を入れる。", "味噌を溶き入れ、落し蓋をして煮る。"] },
  { name: "肉じゃが", genre: "和食", ingredients: [{ item: "牛こま切れ肉", amount: 150, unit: "g", category: "肉" }, { item: "じゃがいも", amount: 3, unit: "個", category: "野菜" }, { item: "人参", amount: 1, unit: "本", category: "野菜" }, { item: "玉ねぎ", amount: 1, unit: "個", category: "野菜" }], steps: ["野菜と肉を炒める。", "だし汁、醤油、砂糖、みりんを加えて煮る。", "じゃがいもが柔らかくなるまで煮込む。"] },
  { name: "揚げ出し豆腐", genre: "和食", ingredients: [{ item: "木綿豆腐", amount: 1, unit: "丁", category: "豆製品" }, { item: "片栗粉", amount: 3, unit: "大さじ", category: "粉類" }, { item: "大根", amount: 100, unit: "g", category: "野菜" }], steps: ["豆腐は水切りし、片栗粉をまぶして揚げる。", "だし汁、醤油、みりんで作ったつゆをかける。", "大根おろしとネギを添える。"] },
  { name: "鶏肉と根菜の筑前煮", genre: "和食", ingredients: [{ item: "鶏もも肉", amount: 200, unit: "g", category: "肉" }, { item: "ごぼう", amount: 0.5, unit: "本", category: "野菜" }, { item: "レンコン", amount: 100, unit: "g", category: "野菜" }, { item: "人参", amount: 0.5, unit: "本", category: "野菜" }], steps: ["材料を一口大に切り、鶏肉から炒める。", "野菜を加えて炒め合わせる。", "だし汁、醤油、みりんを加えて煮含める。"] },
  { name: "カレイの煮付け", genre: "和食", ingredients: [{ item: "カレイ", amount: 2, unit: "切れ", category: "魚" }, { item: "醤油", amount: 3, unit: "大さじ", category: "調味料" }, { item: "酒", amount: 3, unit: "大さじ", category: "調味料" }, { item: "みりん", amount: 3, unit: "大さじ", category: "調味料" }], steps: ["鍋に調味料と水、生姜を入れて煮立てる。", "カレイを入れ、落し蓋をして中火で10分ほど煮る。", "煮汁をかけながら照りを出す。"] },
  { name: "豚汁", genre: "和食", ingredients: [{ item: "豚バラ肉", amount: 150, unit: "g", category: "肉" }, { item: "大根", amount: 100, unit: "g", category: "野菜" }, { item: "人参", amount: 50, unit: "g", category: "野菜" }, { item: "ごぼう", amount: 50, unit: "g", category: "野菜" }, { item: "味噌", amount: 4, unit: "大さじ", category: "調味料" }], steps: ["野菜と豚肉をごま油で炒める。", "だし汁を加えて野菜が柔らかくなるまで煮る。", "火を止めて味噌を溶き入れる。"] },
  { name: "親子丼", genre: "和食", ingredients: [{ item: "鶏もも肉", amount: 150, unit: "g", category: "肉" }, { item: "玉ねぎ", amount: 0.5, unit: "個", category: "野菜" }, { item: "卵", amount: 2, unit: "個", category: "卵・乳製品" }], steps: ["鶏肉と玉ねぎをだし汁、醤油、みりんで煮る。", "火が通ったら溶き卵を回し入れる。", "ご飯の上にのせる。"] },
  { name: "天ぷら盛り合わせ", genre: "和食", ingredients: [{ item: "えび", amount: 4, unit: "尾", category: "魚介" }, { item: "なす", amount: 1, unit: "本", category: "野菜" }, { item: "かぼちゃ", amount: 100, unit: "g", category: "野菜" }, { item: "天ぷら粉", amount: 1, unit: "カップ", category: "粉類" }], steps: ["材料を食べやすい大きさに切る。", "天ぷら粉を水で溶いて衣を作る。", "170℃の油で揚げる。"] },
  
  // 洋食
  { name: "ハンバーグ", genre: "洋食", ingredients: [{ item: "合挽き肉", amount: 300, unit: "g", category: "肉" }, { item: "玉ねぎ", amount: 1, unit: "個", category: "野菜" }, { item: "卵", amount: 1, unit: "個", category: "卵・乳製品" }, { item: "パン粉", amount: 0.5, unit: "カップ", category: "粉類" }], steps: ["みじん切りにした玉ねぎを炒める。", "全ての材料を混ぜてこね、成形する。", "フライパンで両面に焼き色をつけ、蒸し焼きにする。"] },
  { name: "チキンのトマト煮込み", genre: "洋食", ingredients: [{ item: "鶏もも肉", amount: 300, unit: "g", category: "肉" }, { item: "トマト缶", amount: 1, unit: "缶", category: "缶詰" }, { item: "にんにく", amount: 1, unit: "かけ", category: "野菜" }, { item: "玉ねぎ", amount: 1, unit: "個", category: "野菜" }], steps: ["鶏肉に焼き色をつける。", "にんにくと玉ねぎを炒め、トマト缶を加えて煮込む。", "鶏肉を戻し入れ、柔らかくなるまで煮る。"] },
  { name: "エビのクリームパスタ", genre: "洋食", ingredients: [{ item: "パスタ", amount: 200, unit: "g", category: "穀物" }, { item: "エビ", amount: 150, unit: "g", category: "魚介" }, { item: "生クリーム", amount: 200, unit: "ml", category: "卵・乳製品" }], steps: ["パスタを茹でる。", "フライパンでエビを炒め、生クリームを加えて煮詰める。", "茹で上がったパスタをソースと絡める。"] },
  { name: "ビーフシチュー", genre: "洋食", ingredients: [{ item: "牛すね肉", amount: 400, unit: "g", category: "肉" }, { item: "デミグラスソース缶", amount: 1, unit: "缶", category: "缶詰" }, { item: "赤ワイン", amount: 200, unit: "ml", category: "調味料" }, { item: "じゃがいも", amount: 2, unit: "個", category: "野菜" }], steps: ["牛肉と野菜を炒める。", "赤ワインを加えてアルコールを飛ばし、デミグラスソースと水で煮込む。", "肉が柔らかくなるまでじっくり煮込む。"] },
  { name: "シーフードグラタン", genre: "洋食", ingredients: [{ item: "エビ", amount: 100, unit: "g", category: "魚介" }, { item: "ホタテ", amount: 100, unit: "g", category: "魚介" }, { item: "牛乳", amount: 400, unit: "ml", category: "卵・乳製品" }, { item: "チーズ", amount: 100, unit: "g", category: "卵・乳製品" }], steps: ["ホワイトソースを作る。", "シーフードとマカロニを加えて混ぜる。", "チーズを乗せてオーブンで焼き色がつくまで焼く。"] },
  { name: "ポークソテー オニオンソース", genre: "洋食", ingredients: [{ item: "豚ロース厚切り", amount: 2, unit: "枚", category: "肉" }, { item: "玉ねぎ", amount: 1, unit: "個", category: "野菜" }, { item: "醤油", amount: 2, unit: "大さじ", category: "調味料" }], steps: ["豚肉の筋を切り、塩コショウで下味をつける。", "フライパンで両面を焼き、火を通す。", "すりおろした玉ねぎと醤油、みりんでソースを作り、肉にかける。"] },
  { name: "アクアパッツァ", genre: "洋食", ingredients: [{ item: "白身魚", amount: 1, unit: "尾", category: "魚" }, { item: "あさり", amount: 200, unit: "g", category: "魚介" }, { item: "ミニトマト", amount: 10, unit: "個", category: "野菜" }, { item: "オリーブオイル", amount: 3, unit: "大さじ", category: "調味料" }], steps: ["フライパンにオリーブオイルとにんにくを熱し、魚を焼く。", "あさり、ミニトマト、白ワインを加えて蓋をし、蒸し煮にする。", "あさりの口が開いたら完成。"] },
  { name: "ラタトゥイユ", genre: "洋食", ingredients: [{ item: "なす", amount: 2, unit: "本", category: "野菜" }, { item: "ズッキーニ", amount: 1, unit: "本", category: "野菜" }, { item: "パプリカ", amount: 1, unit: "個", category: "野菜" }, { item: "トマト缶", amount: 1, unit: "缶", category: "缶詰" }], steps: ["野菜を角切りにする。", "オリーブオイルで野菜を炒める。", "トマト缶とハーブを加えて野菜が柔らかくなるまで煮込む。"] },
  { name: "オムライス", genre: "洋食", ingredients: [{ item: "ご飯", amount: 300, unit: "g", category: "穀物" }, { item: "鶏もも肉", amount: 100, unit: "g", category: "肉" }, { item: "玉ねぎ", amount: 0.5, unit: "個", category: "野菜" }, { item: "卵", amount: 4, unit: "個", category: "卵・乳製品" }], steps: ["鶏肉と玉ねぎでチキンライスを作る。", "薄焼き卵を作り、チキンライスを包む。", "ケチャップをかける。"] },
  { name: "ミネストローネ", genre: "洋食", ingredients: [{ item: "ベーコン", amount: 50, unit: "g", category: "肉" }, { item: "キャベツ", amount: 100, unit: "g", category: "野菜" }, { item: "セロリ", amount: 1, unit: "本", category: "野菜" }, { item: "トマト缶", amount: 1, unit: "缶", category: "缶詰" }], steps: ["野菜とベーコンを角切りにして炒める。", "トマト缶と水を加えて煮込む。", "コンソメで味を調える。"] },
  
  // 中華
  { name: "麻婆豆腐", genre: "中華", ingredients: [{ item: "豚ひき肉", amount: 150, unit: "g", category: "肉" }, { item: "木綿豆腐", amount: 1, unit: "丁", category: "豆製品" }, { item: "豆板醤", amount: 1, unit: "大さじ", category: "調味料" }, { item: "長ネギ", amount: 0.5, unit: "本", category: "野菜" }], steps: ["ひき肉を炒め、豆板醤と甜麺醤で味付けする。", "豆腐とスープを加えて煮る。", "水溶き片栗粉でとろみをつけ、ネギとラー油を加える。"] },
  { name: "青椒肉絲", genre: "中華", ingredients: [{ item: "豚肉", amount: 150, unit: "g", category: "肉" }, { item: "ピーマン", amount: 3, unit: "個", category: "野菜" }, { item: "たけのこ", amount: 100, unit: "g", category: "野菜" }], steps: ["豚肉、ピーマン、たけのこを細切りにする。", "豚肉に下味をつけ、炒める。", "野菜を加えて炒め、オイスターソースなどで味付けする。"] },
  { name: "エビチリ", genre: "中華", ingredients: [{ item: "エビ", amount: 200, unit: "g", category: "魚介" }, { item: "ケチャップ", amount: 3, unit: "大さじ", category: "調味料" }, { item: "豆板醤", amount: 1, unit: "小さじ", category: "調味料" }], steps: ["エビに下味をつけ、片栗粉をまぶして揚げるか焼く。", "ケチャップ、豆板醤などで作ったソースと絡める。", "長ネギのみじん切りを加える。"] },
  { name: "回鍋肉", genre: "中華", ingredients: [{ item: "豚バラ肉", amount: 200, unit: "g", category: "肉" }, { item: "キャベツ", amount: 0.25, unit: "個", category: "野菜" }, { item: "甜麺醤", amount: 2, unit: "大さじ", category: "調味料" }], steps: ["豚肉を炒め、一度取り出す。", "キャベツなどの野菜を炒める。", "肉を戻し入れ、甜麺醤などの調味料で味付けする。"] },
  { name: "油淋鶏", genre: "中華", ingredients: [{ item: "鶏もも肉", amount: 1, unit: "枚", category: "肉" }, { item: "長ネギ", amount: 0.5, unit: "本", category: "野菜" }, { item: "醤油", amount: 3, unit: "大さじ", category: "調味料" }, { item: "酢", amount: 2, unit: "大さじ", category: "調味料" }], steps: ["鶏肉に片栗粉をまぶして揚げる。", "長ネギ、醤油、酢、砂糖などで作ったタレを作る。", "揚げた鶏肉を食べやすく切り、タレをかける。"] },
  { name: "餃子", genre: "中華", ingredients: [{ item: "豚ひき肉", amount: 200, unit: "g", category: "肉" }, { item: "キャベツ", amount: 200, unit: "g", category: "野菜" }, { item: "ニラ", amount: 0.5, unit: "束", category: "野菜" }, { item: "餃子の皮", amount: 30, unit: "枚", category: "粉類" }], steps: ["キャベツとニラをみじん切りにする。", "ひき肉と野菜、調味料を混ぜて餡を作る。", "皮で餡を包み、焼く。"] },
  { name: "天津飯", genre: "中華", ingredients: [{ item: "卵", amount: 3, unit: "個", category: "卵・乳製品" }, { item: "カニカマ", amount: 50, unit: "g", category: "魚介" }, { item: "ご飯", amount: 200, unit: "g", category: "穀物" }], steps: ["カニカマを加えてカニ玉を作る。", "ご飯の上にカニ玉をのせる。", "醤油、酢、砂糖で作った甘酢あんをかける。"] },
  { name: "酢豚", genre: "中華", ingredients: [{ item: "豚肩ロース", amount: 250, unit: "g", category: "肉" }, { item: "玉ねぎ", amount: 1, unit: "個", category: "野菜" }, { item: "ピーマン", amount: 2, unit: "個", category: "野菜" }, { item: "人参", amount: 1, unit: "本", category: "野菜" }], steps: ["豚肉と野菜を乱切りにし、豚肉は揚げる。", "フライパンで野菜を炒める。", "揚げた豚肉と甘酢あんを加えて絡める。"] },
  { name: "中華風コーンスープ", genre: "中華", ingredients: [{ item: "クリームコーン缶", amount: 1, unit: "缶", category: "缶詰" }, { item: "卵", amount: 1, unit: "個", category: "卵・乳製品" }, { item: "鶏ガラスープの素", amount: 1, unit: "大さじ", category: "調味料" }], steps: ["鍋にコーン缶、水、鶏ガラスープを入れて温める。", "溶き卵を少しずつ流し入れる。", "塩コショウで味を調え、ごま油をたらす。"] },
  { name: "八宝菜", genre: "中華", ingredients: [{ item: "豚肉", amount: 100, unit: "g", category: "肉" }, { item: "エビ", amount: 100, unit: "g", category: "魚介" }, { item: "白菜", amount: 200, unit: "g", category: "野菜" }, { item: "うずらの卵", amount: 6, unit: "個", category: "卵・乳製品" }], steps: ["材料を食べやすい大きさに切る。", "豚肉とエビを炒め、野菜を加えてさらに炒める。", "スープを加えて煮込み、水溶き片栗粉でとろみをつける。"] },
  
  // その他
  { name: "ガパオライス", genre: "その他", ingredients: [{ item: "鶏ひき肉", amount: 200, unit: "g", category: "肉" }, { item: "バジル", amount: 10, unit: "枚", category: "ハーブ" }, { item: "パプリカ", amount: 0.5, unit: "個", category: "野菜" }, { item: "目玉焼き", amount: 1, unit: "個分", category: "卵・乳製品" }], steps: ["ひき肉とパプリカを炒め、ナンプラーとオイスターソースで味付けする。", "火を止める直前にバジルを加える。", "ご飯にのせ、目玉焼きを添える。"] },
  { name: "タコライス", genre: "その他", ingredients: [{ item: "合挽き肉", amount: 200, unit: "g", category: "肉" }, { item: "レタス", amount: 100, unit: "g", category: "野菜" }, { item: "トマト", amount: 1, unit: "個", category: "野菜" }, { item: "チーズ", amount: 50, unit: "g", category: "卵・乳製品" }], steps: ["ひき肉を炒め、チリパウダーやケチャップで味付けする。", "ご飯の上に、レタス、タコミート、トマト、チーズをのせる。", "サルサソースをかける。"] },
  { name: "グリーンカレー", genre: "その他", ingredients: [{ item: "鶏もも肉", amount: 250, unit: "g", category: "肉" }, { item: "グリーンカレーペースト", amount: 50, unit: "g", category: "調味料" }, { item: "ココナッツミルク", amount: 400, unit: "ml", category: "缶詰" }, { item: "なす", amount: 2, unit: "本", category: "野菜" }], steps: ["鍋でカレーペーストを炒め、香りを出す。", "鶏肉を加えて炒め、ココナッツミルクと野菜を加えて煮込む。", "ナンプラーで味を調える。"] },
  { name: "ビビンバ", genre: "その他", ingredients: [{ item: "牛こま切れ肉", amount: 150, unit: "g", category: "肉" }, { item: "ほうれん草", amount: 0.5, unit: "束", category: "野菜" }, { item: "もやし", amount: 100, unit: "g", category: "野菜" }, { item: "コチュジャン", amount: 1, unit: "大さじ", category: "調味料" }], steps: ["牛肉を焼肉のタレで炒める。", "ほうれん草ともやしでナムルを作る。", "ご飯の上に具材を彩りよく盛り付け、コチュジャンを添える。"] },
  { name: "フォー", genre: "その他", ingredients: [{ item: "フォー（乾麺）", amount: 150, unit: "g", category: "穀物" }, { item: "鶏むね肉", amount: 100, unit: "g", category: "肉" }, { item: "もやし", amount: 100, unit: "g", category: "野菜" }, { item: "香草（パクチーなど）", amount: 1, unit: "束", category: "ハーブ" }], steps: ["フォーを茹でる。鶏肉は茹でて割いておく。", "器にフォーを入れ、鶏ガラスープを注ぐ。", "鶏肉、もやし、香草をトッピングし、レモンを絞る。"] },
  { name: "ヤンニョムチキン", genre: "その他", ingredients: [{ item: "鶏もも肉", amount: 300, unit: "g", category: "肉" }, { item: "片栗粉", amount: 3, unit: "大さじ", category: "粉類" }, { item: "コチュジャン", amount: 2, unit: "大さじ", category: "調味料" }, { item: "ケチャップ", amount: 2, unit: "大さじ", category: "調味料" }], steps: ["鶏肉に片栗粉をまぶして揚げる。", "コチュジャン、ケチャップ、砂糖、にんにくでタレを作る。", "揚げた鶏肉にタレを絡める。"] },
  { name: "タンドリーチキン", genre: "その他", ingredients: [{ item: "鶏もも肉", amount: 300, unit: "g", category: "肉" }, { item: "ヨーグルト", amount: 100, unit: "g", category: "卵・乳製品" }, { item: "カレー粉", amount: 1, unit: "大さじ", category: "調味料" }], steps: ["ヨーグルトとスパイスを混ぜたタレに鶏肉を漬け込む。", "オーブンやフライパンでじっくりと焼く。", "レモンを添える。"] },
  { name: "キーマカレー", genre: "その他", ingredients: [{ item: "合挽き肉", amount: 300, unit: "g", category: "肉" }, { item: "玉ねぎ", amount: 1, unit: "個", category: "野菜" }, { item: "トマト缶", amount: 0.5, unit: "缶", category: "缶詰" }, { item: "カレールー", amount: 2, unit: "片", category: "調味料" }], steps: ["玉ねぎをみじん切りにし、飴色になるまで炒める。", "ひき肉を加えて炒め、トマト缶とカレールーで煮込む。", "温泉卵をのせても美味しい。"] },
  { name: "チヂミ", genre: "その他", ingredients: [{ item: "ニラ", amount: 1, unit: "束", category: "野菜" }, { item: "シーフードミックス", amount: 150, unit: "g", category: "魚介" }, { item: "チヂミ粉", amount: 200, unit: "g", category: "粉類" }], steps: ["ニラを切り、シーフードとチヂミ粉、水を混ぜて生地を作る。", "ごま油を引いたフライパンで両面をカリッと焼く。", "酢醤油のタレでいただく。"] },
  { name: "プルコギ", genre: "その他", ingredients: [{ item: "牛薄切り肉", amount: 300, unit: "g", category: "肉" }, { item: "玉ねぎ", amount: 1, unit: "個", category: "野菜" }, { item: "パプリカ", amount: 1, unit: "個", category: "野菜" }], steps: ["牛肉を醤油、砂糖、ごま油、にんにくで下味をつける。", "野菜と一緒に炒める。", "春雨を加えても良い。"] },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const generateNewWeek = (): WeeklyMeal[] => {
  const shuffled = [...recipePool].sort(() => 0.5 - Math.random());
  return days.map((day, index) => ({
    day,
    recipe: shuffled[index % shuffled.length],
    completed: false
  }));
};

// --- Appコンポーネント ---
export default function App() {
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>(() => {
    const savedMeals = localStorage.getItem('weeklyMeals');
    return savedMeals ? JSON.parse(savedMeals) : generateNewWeek();
  });
  const [history, setHistory] = useState<WeeklyMeal[][]>(() => {
    const savedHistory = localStorage.getItem('mealHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const savedCheckedItems = localStorage.getItem('checkedItems');
    return savedCheckedItems ? new Set(JSON.parse(savedCheckedItems)) : new Set();
  });

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
  }, [weeklyMeals]);

  useEffect(() => {
    localStorage.setItem('mealHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('checkedItems', JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems]);


  const handleGenerateNewWeek = (isNew: boolean = true) => {
    if (isNew && weeklyMeals.length > 0) {
      setHistory(prev => [weeklyMeals, ...prev]);
    }
    const newWeek = generateNewWeek();
    setWeeklyMeals(newWeek);
    setCheckedItems(new Set());
  };

  const handleToggleComplete = (day: string) => {
    const toggledMeal = weeklyMeals.find(meal => meal.day === day);
    if (!toggledMeal) return;

    const isLastDay = day === 'Sun';
    const isCompleting = !toggledMeal.completed;

    setWeeklyMeals(currentMeals =>
      currentMeals.map(meal =>
        meal.day === day ? { ...meal, completed: !meal.completed } : meal
      )
    );
    
    if (isLastDay && isCompleting) {
      setTimeout(() => {
        handleGenerateNewWeek();
      }, 500);
    }
  };

  const handleToggleCheckedItem = (itemName: string) => {
    setCheckedItems(prevCheckedItems => {
      const newCheckedItems = new Set(prevCheckedItems);
      if (newCheckedItems.has(itemName)) {
        newCheckedItems.delete(itemName);
      } else {
        newCheckedItems.add(itemName);
      }
      return newCheckedItems;
    });
  };

  const shoppingList = useMemo(() => {
    const allIngredients = weeklyMeals.flatMap(meal => meal.recipe.ingredients);
    const aggregated: Record<string, { amount: number; unit: string, category: string, item: string }> = {};
    allIngredients.forEach(ing => {
      const key = `${ing.item}(${ing.unit})`;
      if (aggregated[key]) {
        aggregated[key].amount += ing.amount;
      } else {
        aggregated[key] = { ...ing };
      }
    });
    const categorized = Object.values(aggregated).reduce((acc, data) => {
        const { category } = data;
        if (!acc[category]) acc[category] = [];
        acc[category].push(data);
        return acc;
    }, {} as Record<string, {item: string, amount: number, unit: string}[]>);
    return Object.entries(categorized).sort(([catA], [catB]) => catA.localeCompare(catB));
  }, [weeklyMeals]);

  return (
    <div className="dashboard">
      <header>
        <h1>Weekly Meal Planner</h1>
      </header>
      <main>
        <div className="main-grid">
          <section className="card weekly-plan">
            <h2><MenuIcon /> This Week's Menu</h2>
            <ul>
              {weeklyMeals.map(meal => (
                <li key={meal.day} className={meal.completed ? "completed" : ""}>
                  <input type="checkbox" checked={meal.completed} onChange={() => handleToggleComplete(meal.day)} />
                  <span className="day">{meal.day}</span>
                  <div className="recipe-info" onClick={() => setSelectedRecipe(meal.recipe)}>
                    <span className={`genre-tag ${meal.recipe.genre.toLowerCase()}`}>{meal.recipe.genre}</span>
                    <span className="recipe-name">{meal.recipe.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="card side-panel">
            <div className="toggle-header">
              <h2><ShoppingCartIcon /> Shopping List</h2>
              <button onClick={() => setShowShoppingList(!showShoppingList)} className="btn-toggle">{showShoppingList ? "Hide" : "Show"}</button>
            </div>
            {showShoppingList && (
              <div className="list-container">
                {shoppingList.map(([category, items]) => (
                    <div key={category} className="shopping-category">
                        <h3>{category}</h3>
                        <ul>
                        {items.map(ing => (
                            <li key={ing.item} className={checkedItems.has(ing.item) ? "completed-item" : ""}>
                              <input
                                type="checkbox"
                                checked={checkedItems.has(ing.item)}
                                onChange={() => handleToggleCheckedItem(ing.item)}
                              />
                              <span>{ing.item}: {ing.amount}{ing.unit}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                ))}
              </div>
            )}
            <div className="toggle-header">
              <h2><HistoryIcon /> History</h2>
              <button onClick={() => setShowHistory(!showHistory)} className="btn-toggle">{showHistory ? "Hide" : "Show"}</button>
            </div>
            {showHistory && history.length > 0 && (
              <div className="history-container">
                {history.map((week, index) => (
                  <div key={index} className="history-week">
                    <h4>Week {history.length - index}</h4>
                    <ul>
                      {week.map(meal => (
                        <li key={meal.day}>
                          <span>{meal.day}: {meal.recipe.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      {selectedRecipe && (
        <div className="modal-backdrop" onClick={() => setSelectedRecipe(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className={`genre-tag modal-genre ${selectedRecipe.genre.toLowerCase()}`}>{selectedRecipe.genre}</span>
            <h2>{selectedRecipe.name}</h2>
            <div className="modal-body">
              <div className="ingredients">
                <h3>Ingredients</h3>
                <ul>
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i}>
                      <span>{ing.item}</span>
                      <span>{ing.amount}{ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="steps">
                <h3>Instructions</h3>
                <ol>
                  {selectedRecipe.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            <button onClick={() => setSelectedRecipe(null)} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}