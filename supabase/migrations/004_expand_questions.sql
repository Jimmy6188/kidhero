-- Clear old grade 3 questions and reseed with expanded question bank
BEGIN;

DELETE FROM questions WHERE grade = 3;

-- ============================================================
-- MATH (35 questions, difficulty 1-5)
-- ============================================================

-- Math Difficulty 1: Basic multiplication & division
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('math', 3, 1, 'choice', '{"stem":"12 x 3 = ?","options":["36","33","39","35"]}', '{"correct":0}', '12 x 3 = 36', '乘法口诀'),
('math', 3, 1, 'choice', '{"stem":"48 / 6 = ?","options":["7","8","9","6"]}', '{"correct":1}', '48 / 6 = 8，六八四十八', '除法运算'),
('math', 3, 1, 'choice', '{"stem":"7 x 8 = ?","options":["54","56","48","64"]}', '{"correct":1}', '7 x 8 = 56，七八五十六', '乘法口诀'),
('math', 3, 1, 'choice', '{"stem":"81 / 9 = ?","options":["8","7","9","6"]}', '{"correct":2}', '81 / 9 = 9，九九八十一', '除法运算'),
('math', 3, 1, 'choice', '{"stem":"6 x 9 = ?","options":["52","56","54","48"]}', '{"correct":2}', '6 x 9 = 54，六九五十四', '乘法口诀'),
('math', 3, 1, 'fill', '{"stem":"56 / 7 = (填数字)"}', '{"correct":"8"}', '56 / 7 = 8，七八五十六', '除法运算'),
('math', 3, 1, 'choice', '{"stem":"9 x 9 = ?","options":["81","72","91","79"]}', '{"correct":0}', '9 x 9 = 81，九九八十一', '乘法口诀');

-- Math Difficulty 2: Area, perimeter, fractions
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('math', 3, 2, 'choice', '{"stem":"一个长方形长5厘米，宽3厘米，面积是多少？","options":["15平方厘米","16平方厘米","8平方厘米","12平方厘米"]}', '{"correct":0}', '长方形面积 = 长 x 宽 = 5 x 3 = 15平方厘米', '面积计算'),
('math', 3, 2, 'choice', '{"stem":"一个正方形边长4厘米，周长是多少？","options":["12厘米","16厘米","8厘米","20厘米"]}', '{"correct":1}', '正方形周长 = 边长 x 4 = 4 x 4 = 16厘米', '周长计算'),
('math', 3, 2, 'choice', '{"stem":"把一个西瓜平均切成8份，吃了3份，吃了这个西瓜的几分之几？","options":["3/8","3/5","5/8","8/3"]}', '{"correct":0}', '8份中的3份就是八分之三，写作 3/8', '分数认识'),
('math', 3, 2, 'fill', '{"stem":"一个长方形的长是7厘米，宽是5厘米，周长是 (填数字) 厘米"}', '{"correct":"24"}', '长方形周长 = (长+宽) x 2 = (7+5) x 2 = 24厘米', '周长计算'),
('math', 3, 2, 'choice', '{"stem":"一个正方形的面积是25平方厘米，边长是多少？","options":["5厘米","6厘米","4厘米","8厘米"]}', '{"correct":0}', '5 x 5 = 25，所以边长是5厘米', '面积与边长'),
('math', 3, 2, 'choice', '{"stem":"1/4 + 2/4 = ?","options":["3/4","3/8","1/2","2/4"]}', '{"correct":0}', '同分母分数相加，分母不变，分子相加：1+2=3，结果是 3/4', '分数加法'),
('math', 3, 2, 'fill', '{"stem":"一个长方形花坛长8米，宽6米，面积是 (填数字) 平方米"}', '{"correct":"48"}', '长方形面积 = 长 x 宽 = 8 x 6 = 48平方米', '面积计算');

-- Math Difficulty 3: Word problems, multi-step
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('math', 3, 3, 'choice', '{"stem":"小明有24颗糖，平均分给4个小朋友，每人几颗？","options":["5颗","6颗","7颗","8颗"]}', '{"correct":1}', '24 / 4 = 6，每人6颗', '应用题'),
('math', 3, 3, 'choice', '{"stem":"商店有3盒铅笔，每盒12支，一共有多少支？","options":["24支","36支","15支","48支"]}', '{"correct":1}', '3 x 12 = 36支', '应用题'),
('math', 3, 3, 'choice', '{"stem":"小红买了4本书，每本15元，付了100元，应找回多少元？","options":["40元","60元","55元","45元"]}', '{"correct":0}', '4 x 15 = 60元，100 - 60 = 40元', '两步应用题'),
('math', 3, 3, 'fill', '{"stem":"一根绳子长72米，剪成同样长的8段，每段长 (填数字) 米"}', '{"correct":"9"}', '72 / 8 = 9，每段长9米', '除法应用'),
('math', 3, 3, 'choice', '{"stem":"一辆大巴最多坐45人，200人至少需要几辆大巴？","options":["4辆","5辆","6辆","3辆"]}', '{"correct":1}', '200 / 45 = 4余20，4辆不够，至少需要5辆', '有余数除法应用'),
('math', 3, 3, 'choice', '{"stem":"小明每天看15页书，看了6天后还剩30页没看，这本书一共多少页？","options":["90页","100页","120页","105页"]}', '{"correct":2}', '15 x 6 = 90页，90 + 30 = 120页', '两步应用题'),
('math', 3, 3, 'fill', '{"stem":"三年级有156人，平均分成4个班，每班 (填数字) 人"}', '{"correct":"39"}', '156 / 4 = 39，每班39人', '除法应用');

-- Math Difficulty 4: Fractions comparison, geometry
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('math', 3, 4, 'choice', '{"stem":"下面哪个分数最大？","options":["1/2","1/3","1/4","1/5"]}', '{"correct":0}', '同一个整体，分的份数越多，每份越小。1/2 最大', '分数比较'),
('math', 3, 4, 'choice', '{"stem":"一个长方形的周长是24厘米，长是8厘米，宽是多少？","options":["4厘米","6厘米","8厘米","10厘米"]}', '{"correct":0}', '周长24 / 2 = 12，12 - 8 = 4厘米', '周长逆运算'),
('math', 3, 4, 'choice', '{"stem":"小明3天看了45页书，照这样计算，5天能看多少页？","options":["65页","70页","75页","80页"]}', '{"correct":2}', '45 / 3 = 15页/天，15 x 5 = 75页', '归一问题'),
('math', 3, 4, 'fill', '{"stem":"3/7 + 2/7 = (填分数，格式如 5/7)"}', '{"correct":"5/7"}', '同分母分数相加：3+2=5，分母不变，结果 5/7', '分数加法'),
('math', 3, 4, 'choice', '{"stem":"一个正方形的周长是36厘米，面积是多少？","options":["81平方厘米","36平方厘米","64平方厘米","49平方厘米"]}', '{"correct":0}', '边长 = 36 / 4 = 9厘米，面积 = 9 x 9 = 81平方厘米', '综合计算'),
('math', 3, 4, 'choice', '{"stem":"甲数是乙数的3倍，乙数是8，甲乙两数的和是多少？","options":["24","32","16","40"]}', '{"correct":1}', '甲 = 8 x 3 = 24，和 = 24 + 8 = 32', '倍数问题');

-- Math Difficulty 5: Complex word problems, logic
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('math', 3, 5, 'choice', '{"stem":"鸡和兔关在同一个笼子里，共有10个头和26只脚，鸡有几只？","options":["6只","7只","8只","5只"]}', '{"correct":1}', '假设全是鸡：10 x 2 = 20只脚，差26-20=6只脚，兔 = 6 / 2 = 3只，鸡 = 10 - 3 = 7只', '鸡兔同笼'),
('math', 3, 5, 'choice', '{"stem":"小明从1楼走到3楼用了4分钟，照这样速度，从1楼走到6楼需要几分钟？","options":["8分钟","10分钟","12分钟","15分钟"]}', '{"correct":1}', '1楼到3楼走了2层用4分钟，每层2分钟。1楼到6楼走5层，5 x 2 = 10分钟', '爬楼问题'),
('math', 3, 5, 'fill', '{"stem":"一个数加上6，再乘以3，结果是27，这个数是 (填数字)"}', '{"correct":"3"}', '逆推：27 / 3 = 9，9 - 6 = 3', '逆推问题'),
('math', 3, 5, 'choice', '{"stem":"把一根木头锯成5段需要8分钟，锯成10段需要多少分钟？","options":["16分钟","18分钟","20分钟","15分钟"]}', '{"correct":1}', '锯成5段要锯4次，每次8/4=2分钟。锯成10段要锯9次，9 x 2 = 18分钟', '锯木头问题'),
('math', 3, 5, 'choice', '{"stem":"小红有一些邮票，给小明一半后又给小华3张，还剩5张，小红原来有多少张？","options":["16张","13张","18张","10张"]}', '{"correct":0}', '剩5张说明给小华前有5+3=8张，这是原来的一半，原来有8 x 2 = 16张', '逆推问题');

-- ============================================================
-- CHINESE (35 questions, difficulty 1-5)
-- ============================================================

-- Chinese Difficulty 1: Basic poetry, idioms, characters
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('chinese', 3, 1, 'choice', '{"stem":"春眠不觉晓 的下一句是？","options":["处处闻啼鸟","花落知多少","夜来风雨声","独钓寒江雪"]}', '{"correct":0}', '孟浩然《春晓》：春眠不觉晓，处处闻啼鸟', '古诗默写'),
('chinese', 3, 1, 'choice', '{"stem":"床前明月光 出自哪首诗？","options":["《静夜思》","《春晓》","《登鹳雀楼》","《悯农》"]}', '{"correct":0}', '李白《静夜思》：床前明月光，疑是地上霜', '古诗默写'),
('chinese', 3, 1, 'choice', '{"stem":"画蛇添足 的意思是？","options":["多此一举","画得很好","蛇没有脚","做事认真"]}', '{"correct":0}', '画蛇添足：比喻多此一举，做了多余的事', '成语理解'),
('chinese', 3, 1, 'choice', '{"stem":"守株待兔 告诉我们什么道理？","options":["不能指望侥幸","要勤劳","兔子很可爱","要种树"]}', '{"correct":0}', '守株待兔：比喻不主动努力，存侥幸心理', '成语理解'),
('chinese', 3, 1, 'choice', '{"stem":"白日依山尽 的下一句是？","options":["黄河入海流","欲穷千里目","更上一层楼","春风吹又生"]}', '{"correct":0}', '王之涣《登鹳雀楼》：白日依山尽，黄河入海流', '古诗默写'),
('chinese', 3, 1, 'choice', '{"stem":"锄禾日当午 出自哪首诗？","options":["《悯农》","《春晓》","《静夜思》","《咏鹅》"]}', '{"correct":0}', '李绅《悯农》：锄禾日当午，汗滴禾下土', '古诗默写'),
('chinese', 3, 1, 'fill', '{"stem":"请写出 春 字的拼音"}', '{"correct":"chūn"}', '春的拼音是 chūn', '拼音');

-- Chinese Difficulty 2: Vocabulary, multi-reading chars, word meaning
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('chinese', 3, 2, 'choice', '{"stem":"举头望明月 的 举头 是什么意思？","options":["抬头","低头","转头","摇头"]}', '{"correct":0}', '举头就是抬头的意思', '词语理解'),
('chinese', 3, 2, 'choice', '{"stem":"下面哪个字是多音字？","options":["乐","大","小","人"]}', '{"correct":0}', '乐是多音字：le（快乐）和 yue（音乐）', '多音字'),
('chinese', 3, 2, 'choice', '{"stem":"下列词语中，书写完全正确的是？","options":["已经","以经","己经","已今"]}', '{"correct":0}', '正确写法是 已经', '字形辨析'),
('chinese', 3, 2, 'choice', '{"stem":"远上寒山石径斜 中 石径 是什么意思？","options":["石头小路","石头山","一条河","一座桥"]}', '{"correct":0}', '石径指石头铺成的小路', '词语理解'),
('chinese', 3, 2, 'fill', '{"stem":"把成语补充完整：亡羊补（ ）"}', '{"correct":"牢"}', '亡羊补牢：出了问题后想办法补救', '成语填空'),
('chinese', 3, 2, 'choice', '{"stem":"下面哪句话用了比喻的修辞手法？","options":["月亮像一个大圆盘","小鸟在唱歌","花儿向我点头","太阳升起来了"]}', '{"correct":0}', '月亮像一个大圆盘，把月亮比作圆盘，是比喻句', '修辞手法'),
('chinese', 3, 2, 'choice', '{"stem":"下列哪个词语表示高兴？","options":["兴高采烈","愁眉苦脸","垂头丧气","怒气冲冲"]}', '{"correct":0}', '兴高采烈形容非常高兴的样子', '词语理解');

-- Chinese Difficulty 3: Idioms, reading comprehension, sentence patterns
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('chinese', 3, 3, 'choice', '{"stem":"叶公好龙 这个成语比喻什么？","options":["口头上喜欢实际上害怕","很喜欢龙","画画很好","勇敢的人"]}', '{"correct":0}', '叶公好龙：比喻口头上说喜欢，实际上并不是真的喜欢', '成语理解'),
('chinese', 3, 3, 'choice', '{"stem":"下列句子中，没有语病的是？","options":["我们要养成讲卫生的好习惯","我们要改进讲卫生的好习惯","我们要增加讲卫生的好习惯","我们要成长讲卫生的好习惯"]}', '{"correct":0}', '养成...习惯 是正确的搭配', '病句辨析'),
('chinese', 3, 3, 'choice', '{"stem":"两个黄鹂鸣翠柳 的作者是？","options":["杜甫","李白","王维","白居易"]}', '{"correct":0}', '杜甫《绝句》：两个黄鹂鸣翠柳，一行白鹭上青天', '文学常识'),
('chinese', 3, 3, 'fill', '{"stem":"把成语补充完整：（ ）苗助长"}', '{"correct":"揠"}', '揠苗助长：比喻违反事物发展规律，急于求成', '成语填空'),
('chinese', 3, 3, 'choice', '{"stem":"下面哪个是拟人句？","options":["春风轻轻地抚摸着我的脸","弯弯的月亮像小船","他跑得像风一样快","雪花像鹅毛一样飘下来"]}', '{"correct":0}', '春风 摸脸 是把春风当作人来写，是拟人句', '修辞手法'),
('chinese', 3, 3, 'choice', '{"stem":"滴水穿石 这个成语告诉我们什么道理？","options":["坚持不懈就能成功","水很厉害","石头很软","要节约用水"]}', '{"correct":0}', '滴水穿石：比喻只要坚持不懈，力量虽小也能做出看起来很难的事', '成语理解'),
('chinese', 3, 3, 'fill', '{"stem":"请写出 乐 的两个拼音（用逗号隔开）"}', '{"correct":"le,yue"}', '乐有两个读音：le（快乐）和 yue（音乐）', '多音字');

-- Chinese Difficulty 4: Ancient poetry understanding, paragraph comprehension
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('chinese', 3, 4, 'choice', '{"stem":"独在异乡为异客，每逢佳节倍思亲 表达了什么情感？","options":["思念亲人","喜欢旅行","讨厌节日","赞美秋天"]}', '{"correct":0}', '王维《九月九日忆山东兄弟》：独自在外，每到节日更加思念亲人', '古诗理解'),
('chinese', 3, 4, 'choice', '{"stem":"下列哪个成语故事出自《三国演义》？","options":["三顾茅庐","守株待兔","亡羊补牢","画蛇添足"]}', '{"correct":0}', '三顾茅庐：刘备三次拜访诸葛亮，出自《三国演义》', '文学常识'),
('chinese', 3, 4, 'choice', '{"stem":"停车坐爱枫林晚 中 坐 是什么意思？","options":["因为","坐下","座位","坐下来看"]}', '{"correct":0}', '坐在这里是 因为 的意思', '古诗字词'),
('chinese', 3, 4, 'choice', '{"stem":"下面哪个词语和其他三个不是同一类？","options":["苹果","白菜","萝卜","黄瓜"]}', '{"correct":0}', '苹果是水果，白菜、萝卜、黄瓜都是蔬菜', '词语分类'),
('chinese', 3, 4, 'fill', '{"stem":"把诗句补充完整：桃花潭水深千尺，（ ）汪伦送我情"}', '{"correct":"不及"}', '李白《赠汪伦》：桃花潭水深千尺，不及汪伦送我情', '古诗默写'),
('chinese', 3, 4, 'choice', '{"stem":"刻舟求剑 这个成语讽刺什么样的人？","options":["不知变通的人","很聪明的人","会游泳的人","很认真的人"]}', '{"correct":0}', '刻舟求剑：讽刺那些拘泥成例、不知变通的人', '成语理解');

-- Chinese Difficulty 5: Advanced reading, writing techniques
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('chinese', 3, 5, 'choice', '{"stem":"飞流直下三千尺 使用了什么修辞手法？","options":["夸张","比喻","拟人","排比"]}', '{"correct":0}', '三千尺是夸张的说法，形容瀑布非常高', '修辞手法'),
('chinese', 3, 5, 'choice', '{"stem":"下面哪句诗描写的是春天？","options":["碧玉妆成一树高，万条垂下绿丝绦","接天莲叶无穷碧，映日荷花别样红","停车坐爱枫林晚，霜叶红于二月花","忽如一夜春风来，千树万树梨花开"]}', '{"correct":0}', '第一句描写春天柳树发芽，出自贺知章《咏柳》', '古诗理解'),
('chinese', 3, 5, 'choice', '{"stem":"买椟还珠 这个成语比喻什么？","options":["取舍不当，丢了西瓜捡芝麻","买了很多珠宝","很会做生意","珍珠很值钱"]}', '{"correct":0}', '买椟还珠：比喻没有眼光，取舍不当', '成语理解'),
('chinese', 3, 5, 'fill', '{"stem":"请写出带有数字的成语（一个即可）"}', '{"correct":"三心二意"}', '三心二意、五颜六色、七上八下 等都是带数字的成语', '成语积累'),
('chinese', 3, 5, 'choice', '{"stem":"下面哪篇文章的作者是安徒生？","options":["《卖火柴的小女孩》","《丑小鸭》","《白雪公主》","《灰姑娘》"]}', '{"correct":0}', '《卖火柴的小女孩》是安徒生的作品，《白雪公主》和《灰姑娘》是格林童话', '文学常识');

-- ============================================================
-- ENGLISH (35 questions, difficulty 1-5)
-- ============================================================

-- English Difficulty 1: Basic vocabulary, greetings
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('english', 3, 1, 'choice', '{"stem":"What color is the sky on a sunny day?","options":["Blue","Red","Green","Yellow"]}', '{"correct":0}', 'The sky is blue on a sunny day.', '颜色单词'),
('english', 3, 1, 'choice', '{"stem":"How many days are there in a week?","options":["Seven","Five","Six","Eight"]}', '{"correct":0}', 'There are seven days in a week.', '数字表达'),
('english', 3, 1, 'choice', '{"stem":"Good ___. (早上好)","options":["morning","afternoon","evening","night"]}', '{"correct":0}', 'Good morning 早上好', '问候语'),
('english', 3, 1, 'choice', '{"stem":"What animal says \"meow\"?","options":["Cat","Dog","Bird","Fish"]}', '{"correct":0}', 'Cat says meow. 猫的叫声是 meow', '动物词汇'),
('english', 3, 1, 'choice', '{"stem":"I have two ___.","options":["hands","hand","a hand","the hand"]}', '{"correct":0}', 'two 后面用复数 hands', '名词复数'),
('english', 3, 1, 'fill', '{"stem":"Thank (填单词)"}', '{"correct":"you"}', 'Thank you 谢谢你', '日常用语'),
('english', 3, 1, 'choice', '{"stem":"How old are you? I am ___ years old.","options":["seven","a seven","the seven","an seven"]}', '{"correct":0}', 'I am seven years old. 我七岁了', '年龄表达');

-- English Difficulty 2: Be verbs, simple sentences
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('english', 3, 2, 'choice', '{"stem":"She ___ a student. (is / am / are)","options":["is","am","are","be"]}', '{"correct":0}', 'She is a student. 第三人称单数用 is', 'be动词'),
('english', 3, 2, 'choice', '{"stem":"What do you like? I like ___.","options":["cats","cat","a cat","the cat"]}', '{"correct":0}', 'I like cats. like 后面用复数表示泛指', '名词复数'),
('english', 3, 2, 'fill', '{"stem":"My name ___ Tom. (is/am/are)"}', '{"correct":"is"}', 'My name is Tom.', 'be动词'),
('english', 3, 2, 'choice', '{"stem":"This is ___ apple.","options":["an","a","the","/"]}', '{"correct":0}', 'apple 以元音开头，用 an', '冠词'),
('english', 3, 2, 'choice', '{"stem":"Where is the cat? It is ___ the box.","options":["in","on","at","to"]}', '{"correct":0}', 'in the box 在盒子里面', '介词'),
('english', 3, 2, 'choice', '{"stem":"I ___ to school every day. (go / goes / going)","options":["go","goes","going","gone"]}', '{"correct":0}', 'I go to school. 主语是 I 用原形 go', '动词形式'),
('english', 3, 2, 'fill', '{"stem":"There are three (填单词) on the table. (book)"}', '{"correct":"books"}', 'three 后面名词用复数 books', '名词复数');

-- English Difficulty 3: Sentence structure, daily conversation
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('english', 3, 3, 'choice', '{"stem":"Choose the correct sentence.","options":["I have two books.","I have two book.","I has two books.","I having two books."]}', '{"correct":0}', 'I have two books. two 后面用复数 books', '句子结构'),
('english', 3, 3, 'choice', '{"stem":"___ is your favorite color? - Blue.","options":["What","Where","Who","How"]}', '{"correct":0}', 'What 什么。问颜色用 What', '疑问词'),
('english', 3, 3, 'choice', '{"stem":"She ___ English every morning. (study / studies / studying)","options":["studies","study","studying","studied"]}', '{"correct":0}', 'She studies. 第三人称单数，动词加 s', '三单形式'),
('english', 3, 3, 'fill', '{"stem":"Can you (填单词) me your pen? (借给)"}', '{"correct":"lend"}', 'Can you lend me your pen? 能借我你的笔吗？', '动词词汇'),
('english', 3, 3, 'choice', '{"stem":"There ___ some milk in the cup.","options":["is","are","am","be"]}', '{"correct":0}', 'milk 是不可数名词，用 is', '主谓一致'),
('english', 3, 3, 'choice', '{"stem":"___ you like some tea? - Yes, please.","options":["Would","Do","Are","Can"]}', '{"correct":0}', 'Would you like...? 是礼貌地询问', '日常对话'),
('english', 3, 3, 'fill', '{"stem":"My mother is a (填单词). She works in a hospital. (医生)"}', '{"correct":"doctor"}', 'My mother is a doctor. 我妈妈是医生', '职业词汇');

-- English Difficulty 4: Past tense, comparatives
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('english', 3, 4, 'choice', '{"stem":"I ___ to the park yesterday. (go / went / going)","options":["went","go","going","goes"]}', '{"correct":0}', 'yesterday 表示过去，用过去式 went', '过去时态'),
('english', 3, 4, 'choice', '{"stem":"The elephant is ___ than the mouse.","options":["bigger","big","biggest","more big"]}', '{"correct":0}', '两者比较用比较级 bigger', '比较级'),
('english', 3, 4, 'choice', '{"stem":"She ___ her homework last night. (finish / finished / finishes)","options":["finished","finish","finishes","finishing"]}', '{"correct":0}', 'last night 过去时间，用过去式 finished', '过去时态'),
('english', 3, 4, 'fill', '{"stem":"I am (填单词) than my brother. (tall 的比较级)"}', '{"correct":"taller"}', 'tall 的比较级是 taller', '比较级'),
('english', 3, 4, 'choice', '{"stem":"___ did you go yesterday? - I went to the library.","options":["Where","What","When","Who"]}', '{"correct":0}', 'Where 哪里。回答去了图书馆，问的是地点', '疑问词'),
('english', 3, 4, 'choice', '{"stem":"There are ___ students in our class than in your class.","options":["more","much","most","many"]}', '{"correct":0}', 'more 更多，比较级', '比较级'),
('english', 3, 4, 'fill', '{"stem":"He (填单词) a book last week. (read 的过去式)"}', '{"correct":"read"}', 'read 的过去式还是 read，发音变了', '过去时态');

-- English Difficulty 5: Complex sentences, reading
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('english', 3, 5, 'choice', '{"stem":"If it rains tomorrow, we ___ stay at home.","options":["will","would","are","is"]}', '{"correct":0}', 'If 条件句，主句用 will + 动词原形', '条件句'),
('english', 3, 5, 'choice', '{"stem":"The book is ___ interesting ___ I read it twice.","options":["so...that","too...to","such...that","enough...to"]}', '{"correct":0}', 'so...that 如此...以至于', '句型结构'),
('english', 3, 5, 'choice', '{"stem":"Neither Tom nor his friends ___ going to the party.","options":["are","is","am","be"]}', '{"correct":0}', 'Neither...nor 就近原则，friends 是复数用 are', '主谓一致'),
('english', 3, 5, 'fill', '{"stem":"She is the (填单词) girl in our class. (beautiful 的最高级)"}', '{"correct":"most beautiful"}', 'beautiful 是多音节词，最高级用 most beautiful', '最高级'),
('english', 3, 5, 'choice', '{"stem":"Which sentence is correct?","options":["He told me to open the door.","He told me open the door.","He told me opening the door.","He told me opens the door."]}', '{"correct":0}', 'tell sb to do sth 告诉某人做某事', '句型结构'),
('english', 3, 5, 'choice', '{"stem":"I have lived here ___ 2020.","options":["since","for","in","at"]}', '{"correct":0}', 'since + 时间点，for + 时间段。2020 是时间点用 since', '介词用法');

COMMIT;
