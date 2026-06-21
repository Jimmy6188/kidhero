-- 数学题（三年级）
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('math', 3, 1, 'choice', '{"stem":"12 x 3 = ?","options":["36","33","39","35"]}', '{"correct":0}', '12 x 3 = 36，拆分：10x3=30 + 2x3=6', '乘法口诀'),
('math', 3, 1, 'choice', '{"stem":"48 ÷ 6 = ?","options":["7","8","9","6"]}', '{"correct":1}', '48 ÷ 6 = 8，六八四十八', '除法运算'),
('math', 3, 1, 'choice', '{"stem":"7 x 8 = ?","options":["54","56","48","64"]}', '{"correct":1}', '7 x 8 = 56，七八五十六', '乘法口诀'),
('math', 3, 1, 'choice', '{"stem":"81 ÷ 9 = ?","options":["8","7","9","6"]}', '{"correct":2}', '81 ÷ 9 = 9，九九八十一', '除法运算'),
('math', 3, 2, 'choice', '{"stem":"一个长方形长5厘米，宽3厘米，面积是多少？","options":["15平方厘米","16平方厘米","8平方厘米","12平方厘米"]}', '{"correct":0}', '长方形面积 = 长 × 宽 = 5 × 3 = 15平方厘米', '面积计算'),
('math', 3, 2, 'choice', '{"stem":"一个正方形边长4厘米，周长是多少？","options":["12厘米","16厘米","8厘米","20厘米"]}', '{"correct":1}', '正方形周长 = 边长 × 4 = 4 × 4 = 16厘米', '周长计算'),
('math', 3, 2, 'choice', '{"stem":"把一个西瓜平均切成8份，吃了3份，吃了这个西瓜的几分之几？","options":["3/8","3/5","5/8","8/3"]}', '{"correct":0}', '8份中的3份就是八分之三，写作 3/8', '分数认识'),
('math', 3, 2, 'fill', '{"stem":"一个长方形的长是7厘米，宽是5厘米，周长是 (填数字) 厘米"}', '{"correct":"24"}', '长方形周长 = (长+宽)×2 = (7+5)×2 = 24厘米', '周长计算'),
('math', 3, 3, 'choice', '{"stem":"小明有24颗糖，平均分给4个小朋友，每人几颗？","options":["5颗","6颗","7颗","8颗"]}', '{"correct":1}', '24 ÷ 4 = 6，每人6颗', '应用题'),
('math', 3, 3, 'choice', '{"stem":"商店有3盒铅笔，每盒12支，一共有多少支？","options":["24支","36支","15支","48支"]}', '{"correct":1}', '3 × 12 = 36支', '应用题');

-- 语文题
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('chinese', 3, 1, 'choice', '{"stem":""春眠不觉晓"的下一句是？","options":["处处闻啼鸟","花落知多少","夜来风雨声","独钓寒江雪"]}', '{"correct":0}', '孟浩然《春晓》：春眠不觉晓，处处闻啼鸟', '古诗默写'),
('chinese', 3, 1, 'choice', '{"stem":""床前明月光"出自哪首诗？","options":["《静夜思》","《春晓》","《登鹳雀楼》","《悯农》"]}', '{"correct":0}', '李白《静夜思》：床前明月光，疑是地上霜', '古诗默写'),
('chinese', 3, 1, 'choice', '{"stem":""画蛇添足"的意思是？","options":["多此一举","画得很好","蛇没有脚","做事认真"]}', '{"correct":0}', '画蛇添足：画蛇时给蛇添上脚，比喻多此一举', '成语理解'),
('chinese', 3, 1, 'choice', '{"stem":""守株待兔"告诉我们什么道理？","options":["不能指望侥幸","要勤劳","兔子很可爱","要种树"]}', '{"correct":0}', '守株待兔：比喻不主动努力，而存侥幸心理', '成语理解'),
('chinese', 3, 2, 'fill', '{"stem":"请写出"春"字的拼音："}', '{"correct":"chūn"}', '春的拼音是 chūn，声母是ch，韵母是un', '拼音'),
('chinese', 3, 2, 'choice', '{"stem":""举头望明月"的"举头"是什么意思？","options":["抬头","低头","转头","摇头"]}', '{"correct":0}', '举头就是抬头的意思', '词语理解'),
('chinese', 3, 2, 'choice', '{"stem":"下面哪个字是多音字？","options":["乐","大","小","人"]}', '{"correct":0}', '乐是多音字：lè（快乐）和 yuè（音乐）', '多音字'),
('chinese', 3, 3, 'fill', '{"stem":"把成语补充完整：亡羊补 ( )"}', '{"correct":"牢"}', '亡羊补牢：羊丢了再去修补羊圈，比喻出了问题后想办法补救', '成语填空');

-- 英语题
INSERT INTO questions (subject, grade, difficulty, type, content, answer, explanation, knowledge_point) VALUES
('english', 3, 1, 'choice', '{"stem":"What color is the sky on a sunny day?","options":["Blue","Red","Green","Yellow"]}', '{"correct":0}', 'The sky is blue on a sunny day. 晴天的天空是蓝色的', '颜色单词'),
('english', 3, 1, 'choice', '{"stem":"How many days are there in a week?","options":["Seven","Five","Six","Eight"]}', '{"correct":0}', 'There are seven days in a week. 一周有七天', '数字表达'),
('english', 3, 1, 'choice', '{"stem":"What is this? It is a ___. (图片：苹果)","options":["apple","banana","orange","grape"]}', '{"correct":0}', 'apple 苹果', '水果单词'),
('english', 3, 1, 'choice', '{"stem":"Good ___. (早上好)","options":["morning","afternoon","evening","night"]}', '{"correct":0}', 'Good morning 早上好', '问候语'),
('english', 3, 2, 'choice', '{"stem":"She ___ a student. (is / am / are)","options":["is","am","are","be"]}', '{"correct":0}', 'She is a student. 她是一名学生。第三人称单数用is', 'be动词'),
('english', 3, 2, 'choice', '{"stem":"What do you like? I like ___.","options":["cats","cat","a cat","the cat"]}', '{"correct":0}', 'I like cats. 我喜欢猫。like后面用复数表示泛指', '名词复数'),
('english', 3, 2, 'fill', '{"stem":"填入正确的单词：My name ___ Tom. (is/am/are)"}', '{"correct":"is"}', 'My name is Tom. 我的名字是Tom。', 'be动词'),
('english', 3, 3, 'choice', '{"stem":"Choose the correct sentence.","options":["I have two book.","I have two books.","I has two books.","I having two books."]}', '{"correct":1}', 'I have two books. 我有两本书。two后面用复数books', '句子结构');