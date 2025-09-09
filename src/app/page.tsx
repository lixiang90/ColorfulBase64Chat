'use client';

import { useState, useEffect } from 'react';
import { CodeBracketIcon, DocumentTextIcon, ComputerDesktopIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

// DEFLATE压缩相关类型和算法
interface DeflateResult {
  compressed: Uint8Array;
  originalLength: number;
  compressedLength: number;
}

// DEFLATE压缩算法实现（简化版，基于LZ77）
class DeflateCompression {
  // 简化的LZ77压缩
  static lz77Compress(text: string): Uint8Array {
    // 先将文本转换为UTF-8字节数组
    const textBytes = new TextEncoder().encode(text);
    const result: number[] = [];
    const windowSize = 255; // 简化窗口大小
    
    let i = 0;
    while (i < textBytes.length) {
      let bestMatch = { distance: 0, length: 0 };
      
      // 在滑动窗口中查找最长匹配
      const searchStart = Math.max(0, i - windowSize);
      for (let j = searchStart; j < i; j++) {
        let matchLength = 0;
        while (i + matchLength < textBytes.length && 
               j + matchLength < i &&
               textBytes[j + matchLength] === textBytes[i + matchLength] && 
               matchLength < 255) { // 最大匹配长度
          matchLength++;
        }
        
        if (matchLength > bestMatch.length && matchLength >= 3) {
          bestMatch = {
            distance: i - j,
            length: matchLength
          };
        }
      }
      
      if (bestMatch.length >= 3) {
        // 找到匹配，记录距离和长度
        result.push(1); // 标志位：匹配
        result.push(bestMatch.distance);
        result.push(bestMatch.length);
        i += bestMatch.length;
      } else {
        // 没有找到匹配，记录原始字节
        result.push(0); // 标志位：字面量
        result.push(textBytes[i]);
        i++;
      }
    }
    
    return new Uint8Array(result);
  }

  static compress(text: string): DeflateResult {
    const compressed = this.lz77Compress(text);
    return {
      compressed,
      originalLength: new TextEncoder().encode(text).length,
      compressedLength: compressed.length
    };
  }

  static decompress(compressed: Uint8Array): string {
    const result: number[] = [];
    let i = 0;
    
    while (i < compressed.length) {
      const flag = compressed[i++];
      
      if (flag === 1) {
        // 匹配：读取距离和长度
        if (i + 1 >= compressed.length) break;
        const distance = compressed[i++];
        const length = compressed[i++];
        
        // 复制之前的数据
        const startPos = result.length - distance;
        for (let j = 0; j < length; j++) {
          if (startPos + j >= 0 && startPos + j < result.length) {
            result.push(result[startPos + j]);
          }
        }
      } else {
        // 字面量：直接添加字节
        if (i < compressed.length) {
          result.push(compressed[i++]);
        }
      }
    }
    
    // 将字节数组转换回UTF-8字符串
    try {
      return new TextDecoder('utf-8').decode(new Uint8Array(result));
    } catch (e) {
      console.error('DEFLATE解压缩失败:', e);
      return '';
    }
  }

  static arrayToBase64(array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < array.length; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return btoa(binary);
  }

  static base64ToArray(base64: string): Uint8Array {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return array;
  }
}

const ENCODING_PRESETS = {
  dishes: {
    name: '报菜名',
    description: '相声《报菜名》中的经典菜名',
    avatar: '🍽️',
    chars: [
      '蒸羊羔', '蒸熊掌', '蒸鹿尾儿', '烧花鸭', '烧雏鸡', '烧子鹅', '卤猪', '卤鸭',
      '酱鸡', '腊肉', '松花小肚儿', '晾肉', '香肠儿', '什锦苏盘儿', '熏鸡白肚儿', '清蒸八宝猪',
      '江米酿鸭子', '罐儿野鸡', '罐儿鹌鹑', '卤什件儿', '卤子鹅', '山鸡', '兔脯', '菜蟒',
      '银鱼', '清蒸哈什蚂', '烩鸭丝', '烩鸭腰', '烩鸭条', '清拌鸭丝', '黄心管儿', '焖白鳝',
      '焖黄鳝', '豆豉鲇鱼', '锅烧鲤鱼', '锅烧鲇鱼', '清蒸甲鱼', '抓炒鲤鱼', '抓炒对虾', '软炸里脊',
      '软炸鸡', '什锦套肠儿', '卤煮寒鸦儿', '麻酥油卷儿', '熘鲜蘑', '熘鱼脯', '熘鱼肚', '熘鱼片儿',
      '醋熘肉片儿', '烩三鲜', '烩白蘑', '烩鸽子蛋', '炒银丝', '烩鳗鱼', '炒白虾', '炝青蛤',
      '炒面鱼', '炒竹笋', '芙蓉燕菜', '炒虾仁儿', '烩虾仁儿', '烩腰花儿', '烩海参', '炒蹄筋儿'
    ]
  },
  poetry: {
    name: '古诗词',
    description: '经典古诗词中的优美词汇',
    avatar: '📜',
    chars: [
      '春', '花', '秋', '月', '夏', '雨', '冬', '雪', '山', '水', '风', '云', '日', '星', '夜', '晨',
      '江', '河', '湖', '海', '林', '树', '草', '叶', '鸟', '燕', '鹤', '凤', '龙', '虎', '马', '鹿',
      '梅', '兰', '竹', '菊', '荷', '桃', '柳', '松', '红', '绿', '青', '白', '黄', '紫', '金', '银',
      '琴', '棋', '书', '画', '诗', '词', '歌', '赋', '酒', '茶', '香', '墨', '笔', '纸', '砚', '印'
    ]
  },
  animals: {
    name: '动物世界',
    description: '可爱的动物名称集合',
    avatar: '🐾',
    chars: [
      '猫', '狗', '兔', '鸟', '鱼', '马', '牛', '羊', '猪', '鸡', '鸭', '鹅', '虎', '狮', '熊', '象',
      '猴', '鹿', '狼', '狐', '鼠', '蛇', '龟', '蛙', '蝶', '蜂', '蚁', '蜘蛛', '螃蟹', '虾', '章鱼', '鲸',
      '鹰', '鸽', '燕', '鹤', '孔雀', '企鹅', '猫头鹰', '蝙蝠', '松鼠', '刺猬', '袋鼠', '考拉', '熊猫', '长颈鹿', '斑马', '河马',
      '犀牛', '骆驼', '驴', '骡', '鳄鱼', '蜥蜴', '变色龙', '海豚', '海豹', '海狮', '水母', '海星', '珊瑚', '贝壳', '蜗牛', '蚯蚓'
    ]
  },
  emoji: {
    name: 'Emoji表情',
    description: '常用的Emoji表情符号',
    avatar: '😊',
    chars: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
      '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
      '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
      '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥'
    ]
  },
  colors: {
    name: '颜色世界',
    description: '丰富多彩的颜色名称',
    avatar: '🎨',
    chars: [
      '红', '橙', '黄', '绿', '青', '蓝', '紫', '粉', '白', '黑', '灰', '棕', '金', '银', '铜', '铁',
      '朱红', '深红', '鲜红', '玫红', '桃红', '樱红', '胭脂', '绯红', '橘红', '橙黄', '柠檬', '鹅黄', '嫩黄', '土黄', '金黄', '杏黄',
      '翠绿', '墨绿', '深绿', '浅绿', '嫩绿', '草绿', '森绿', '碧绿', '青绿', '蓝绿', '天蓝', '海蓝', '深蓝', '浅蓝', '宝蓝', '靛蓝',
      '紫红', '深紫', '浅紫', '淡紫', '紫罗兰', '薰衣草', '雪白', '乳白', '米白', '象牙白', '珍珠白', '银白', '炭黑', '墨黑', '漆黑', '乌黑'
    ]
  },
  standard: {
    name: '标准Base64',
    description: '标准Base64字符集',
    avatar: '💻',
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('')
  },
  hakima: {
    name: '哈基码',
    description: '网络流行的哈基米编码字符集',
    avatar: '🤖',
    chars: [
      '哈', '基', '米', '南', '北', '绿', '豆', '阿', '西', '噶', '压', '库', '那', '鲁', '曼', '波',
      '欧', '马', '自', '立', '悠', '嗒', '步', '诺', '斯', '哇', '嗷', '冰', '踩', '背', '叮', '咚',
      '鸡', '大', '狗', '叫', '袋', '鼠', '兴', '奋', '剂', '出', '示', '健', '康', '码', '楼', '上',
      '下', '来', '带', '一', '段', '小', '白', '手', '套', '胖', '宝', '牛', '魔', '呵', '嘿', '喔'
    ]
  }
};

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  encoding?: string;
  isEncoded?: boolean;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  description: string;
  online: boolean;
}

export default function ChatApp() {
  const [selectedFriend, setSelectedFriend] = useState<string>('dishes');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<{[friendId: string]: ChatMessage[]}>({});
  const [compressionMode, setCompressionMode] = useState<'smart' | 'none'>('smart');
  const [useSmartSeparator, setUseSmartSeparator] = useState(true);
  const [customSeparator, setCustomSeparator] = useState('|');
  const [userEncodings, setUserEncodings] = useState<{[key: string]: {name: string, description: string, chars: string[], avatar: string}}>({});
  const [showImportExport, setShowImportExport] = useState(false);
  const [showEditEncoding, setShowEditEncoding] = useState(false);
  const [editingEncoding, setEditingEncoding] = useState<{name: string, description: string, chars: string[]}>({name: '', description: '', chars: Array(64).fill('')});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // 获取当前好友的聊天记录
  const messages = chatHistory[selectedFriend] || [];

  // 更新聊天记录的函数
  const updateMessages = (newMessages: ChatMessage[]) => {
    const newChatHistory = {
      ...chatHistory,
      [selectedFriend]: newMessages
    };
    setChatHistory(newChatHistory);
    localStorage.setItem('chatHistory', JSON.stringify(newChatHistory));
  };

  // 清空当前好友的聊天记录
  const clearCurrentChat = () => {
    if (confirm(`确定要清空与 ${currentFriend?.name} 的聊天记录吗？`)) {
      updateMessages([]);
    }
  };

  // 加载用户编码和聊天记录
  useEffect(() => {
    const saved = localStorage.getItem('userEncodings');
    if (saved) {
      try {
        setUserEncodings(JSON.parse(saved));
      } catch (e) {
        console.error('加载用户编码失败:', e);
      }
    }

    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      try {
        const parsedHistory = JSON.parse(savedChatHistory);
        // 恢复Date对象
        const restoredHistory: {[friendId: string]: ChatMessage[]} = {};
        Object.keys(parsedHistory).forEach(friendId => {
          restoredHistory[friendId] = parsedHistory[friendId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        });
        setChatHistory(restoredHistory);
      } catch (e) {
        console.error('加载聊天记录失败:', e);
      }
    }
  }, []);

  // 保存用户编码
  const saveUserEncodings = (encodings: typeof userEncodings) => {
    setUserEncodings(encodings);
    localStorage.setItem('userEncodings', JSON.stringify(encodings));
  };

  // 获取好友的最后聊天时间
  const getLastChatTime = (friendId: string): Date => {
    const friendMessages = chatHistory[friendId];
    if (!friendMessages || friendMessages.length === 0) {
      return new Date(0); // 如果没有聊天记录，返回最早时间
    }
    return friendMessages[friendMessages.length - 1].timestamp;
  };

  const friends: Friend[] = [
    ...Object.entries(ENCODING_PRESETS).map(([id, preset]) => ({
      id,
      name: preset.name,
      avatar: preset.avatar,
      description: preset.description,
      online: true
    })),
    ...Object.entries(userEncodings).map(([id, preset]) => ({
      id,
      name: preset.name,
      avatar: preset.avatar,
      description: preset.description,
      online: true
    }))
  ].sort((a, b) => {
    // 按最后聊天时间降序排序（最近的在前面）
    const timeA = getLastChatTime(a.id);
    const timeB = getLastChatTime(b.id);
    return timeB.getTime() - timeA.getTime();
  });

  const currentFriend = friends.find(f => f.id === selectedFriend);
  const currentPreset = ENCODING_PRESETS[selectedFriend as keyof typeof ENCODING_PRESETS] || userEncodings[selectedFriend];

  // 编码函数
  const encode = (text: string, chars: string[]): string => {
    if (!text) return '';

    // 获取分隔符（用于后续处理）
    const separator = useSmartSeparator ? smartSeparator(chars) : customSeparator;

    let useCompression = false;
    let compressedData: Uint8Array | null = null;
    let standardBase64 = '';

    // 先生成标准Base64编码
    try {
      standardBase64 = btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      throw new Error('文本编码失败');
    }

    // 智能压缩模式：尝试压缩并比较长度
    if (compressionMode === 'smart') {
      try {
        const deflateResult = DeflateCompression.compress(text);
        const compressedBase64 = DeflateCompression.arrayToBase64(deflateResult.compressed);
        
        if (compressedBase64.length < standardBase64.length) {
          useCompression = true;
          compressedData = deflateResult.compressed;
        }
      } catch (e) {
        console.warn('压缩失败，使用标准编码:', e);
      }
    }

    // 使用压缩数据或标准Base64
    const base64ToEncode = useCompression && compressedData 
      ? DeflateCompression.arrayToBase64(compressedData)
      : standardBase64;

    // 检查是否有歧义来决定是否使用分隔符
    const hasAmbiguity = () => {
      // 检查重复字符
      const uniqueChars = new Set(chars);
      if (uniqueChars.size < chars.length) {
        return true;
      }
      
      // 检查字符包含关系（如"猫"和"猫头鹰"）
      for (let i = 0; i < chars.length; i++) {
        for (let j = 0; j < chars.length; j++) {
          if (i !== j && chars[i] && chars[j]) {
            // 检查一个字符是否是另一个字符的子串
            if (chars[i].includes(chars[j]) || chars[j].includes(chars[i])) {
              return true;
            }
          }
        }
      }
      
      return false;
    };
    
    const shouldUseSeparator = useSmartSeparator ? hasAmbiguity() : false;
    
    // 转换为自定义字符
    let result = '';
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (const char of base64ToEncode) {
      const index = base64Chars.indexOf(char);
      
      if (index !== -1) {
        // 确保字符集有足够的字符，如果不够则循环使用
        const customChar = chars[index % chars.length];
        result += customChar;
      } else {
        result += char; // 保持填充字符 '='
      }
      
      if (shouldUseSeparator) {
        result += separator;
      }
    }
    
    // 移除最后一个分隔符（如果使用了分隔符）
    result = shouldUseSeparator ? result.slice(0, -separator.length) : result;

    return result;
  };

  // 解码函数
  const decode = (encodedText: string, chars: string[]): string => {
    if (!encodedText) return '';

    try {
      let processedText = encodedText;
      const separator = useSmartSeparator ? smartSeparator(chars) : customSeparator;

      // 检查是否有歧义来决定是否移除分隔符
      const hasAmbiguity = () => {
        // 检查重复字符
        const uniqueChars = new Set(chars);
        if (uniqueChars.size < chars.length) {
          return true;
        }
        
        // 检查字符包含关系（如"猫"和"猫头鹰"）
        for (let i = 0; i < chars.length; i++) {
          for (let j = 0; j < chars.length; j++) {
            if (i !== j && chars[i] && chars[j]) {
              // 检查一个字符是否是另一个字符的子串
              if (chars[i].includes(chars[j]) || chars[j].includes(chars[i])) {
                return true;
              }
            }
          }
        }
        
        return false;
      };
      
      const shouldUseSeparator = useSmartSeparator ? hasAmbiguity() : false;
      
      let parts: string[];
      
      // 检测是否包含分隔符
      if (shouldUseSeparator && processedText.includes(separator)) {
        // 按分隔符分割
        parts = processedText.split(separator);
      } else {
        // 智能分割（无分隔符模式）
        parts = smartSplit(processedText, chars);
      }
      
      // 将自定义字符转换回标准Base64
      const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let standardBase64 = '';
      for (const part of parts) {
        if (part === '=') {
          standardBase64 += '=';
        } else {
          const index = chars.indexOf(part);
          if (index !== -1) {
            standardBase64 += base64Chars[index];
          } else {
            throw new Error(`未知字符: ${part}`);
          }
        }
      }
      
      // 解码标准Base64得到原始数据
      const decodedData = decodeURIComponent(escape(atob(standardBase64)));
      
      // 检查是否是DEFLATE压缩数据
      if (decodedData.startsWith('DEFLATE|')) {
        const compressedBase64 = decodedData.substring(8); // 移除'DEFLATE|'前缀
        
        try {
          // 解码DEFLATE压缩数据
          const compressedArray = DeflateCompression.base64ToArray(compressedBase64);
          const originalText = DeflateCompression.decompress(compressedArray);
          
          return originalText;
        } catch (deflateError) {
          throw new Error('DEFLATE解码错误：数据格式不正确');
        }
      } else {
        // 标准Base64解码
        return decodedData;
      }
    } catch (error) {
      throw new Error(`解码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
      };

  // 智能分割函数（无分隔符时使用）
  const smartSplit = (text: string, chars: string[]): string[] => {
    const result: string[] = [];
    let i = 0;
    
    while (i < text.length) {
      let found = false;
      
      // 首先尝试匹配填充字符
      if (text[i] === '=') {
        result.push('=');
        i++;
        continue;
      }
      
      // 按长度从长到短尝试匹配自定义字符
      const sortedChars = [...chars].sort((a, b) => b.length - a.length);
      
      for (const char of sortedChars) {
        if (text.substring(i, i + char.length) === char) {
          result.push(char);
          i += char.length;
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error(`无法解析字符: ${text.substring(i)}`);
      }
    }
    
    return result;
  };

  // 智能分隔符选择
  const smartSeparator = (chars: string[]): string => {
    const separators = ['|', '·', '•', '◦', '▪', '▫', '◆', '◇', '★', '☆'];
    for (const sep of separators) {
      if (!chars.includes(sep)) {
        return sep;
      }
    }
    return '|';
  };

  // 提取消息的纯文本内容（去掉前缀）
  const extractPureContent = (content: string): string => {
    // 去掉"原文: "前缀
    if (content.startsWith('原文: ')) {
      return content.substring(4);
    }
    // 去掉"编码文本: "前缀
    if (content.startsWith('编码文本: ')) {
      return content.substring(6);
    }
    // 如果没有前缀，直接返回原内容
    return content;
  };

  // 复制文本到剪贴板
  const copyToClipboard = async (text: string) => {
    // 提取纯文本内容
    const pureText = extractPureContent(text);
    
    try {
      await navigator.clipboard.writeText(pureText);
      // 可以添加一个简单的提示
      console.log('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案：使用传统的复制方法
      const textArea = document.createElement('textarea');
      textArea.value = pureText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('已复制到剪贴板（降级方案）');
      } catch (fallbackErr) {
        console.error('复制失败（降级方案）:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // 解析txt文件内容
  const parseEncodingFile = (content: string): {name: string, description: string, chars: string[]} | null => {
    try {
      const lines = content.trim().split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 3) {
        throw new Error('文件格式不正确，至少需要3行：名称、描述、字符集');
      }
      
      const name = lines[0].replace(/^名称[:：]\s*/, '');
      const description = lines[1].replace(/^描述[:：]\s*/, '');
      
      // 解析字符集，支持多种分隔符
      const charsLine = lines.slice(2).join(' ').replace(/^字符[:：]\s*/, '');
      let chars: string[];
      
      // 尝试不同的分隔符
      if (charsLine.includes(',')) {
        chars = charsLine.split(',').map(c => c.trim()).filter(c => c);
      } else if (charsLine.includes('|')) {
        chars = charsLine.split('|').map(c => c.trim()).filter(c => c);
      } else if (charsLine.includes(' ')) {
        chars = charsLine.split(/\s+/).filter(c => c);
      } else {
        // 按字符分割
        chars = charsLine.split('').filter(c => c.trim());
      }
      
      if (chars.length !== 64) {
        throw new Error(`字符集必须包含64个字符，当前有${chars.length}个`);
      }
      
      return { name, description, chars };
    } catch (e) {
      console.error('解析文件失败:', e);
      return null;
    }
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.txt')) {
      alert('请选择txt文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseEncodingFile(content);
      
      if (parsed) {
        const key = `user_${Date.now()}`;
        const newEncodings = {
          ...userEncodings,
          [key]: {
            ...parsed,
            avatar: '📁'
          }
        };
        saveUserEncodings(newEncodings);
        alert(`成功导入编码：${parsed.name}`);
      } else {
        alert('文件格式错误，请检查文件内容');
      }
    };
    
    reader.readAsText(file, 'UTF-8');
    event.target.value = ''; // 清空input
  };

  // 导出用户编码为txt文件
  const exportUserEncoding = (encoding: { name: string; description: string; chars: string[] }) => {
    const content = `名称: ${encoding.name}\n描述: ${encoding.description}\n字符: ${encoding.chars.join(',')}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${encoding.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导出全部聊天记录
  const exportAllChatHistory = () => {
    const exportData = {
      exportTime: new Date().toISOString(),
      totalFriends: Object.keys(chatHistory).length,
      totalMessages: Object.values(chatHistory).reduce((sum, messages) => sum + messages.length, 0),
      chatHistory: chatHistory
    };
    
    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `聊天记录_全部_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导出单个好友聊天记录
  const exportFriendChatHistory = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    const friendMessages = chatHistory[friendId] || [];
    
    if (friendMessages.length === 0) {
      alert('该好友暂无聊天记录');
      return;
    }
    
    const exportData = {
      exportTime: new Date().toISOString(),
      friend: {
        id: friendId,
        name: friend?.name || friendId,
        avatar: friend?.avatar || '👤',
        description: friend?.description || ''
      },
      totalMessages: friendMessages.length,
      messages: friendMessages
    };
    
    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `聊天记录_${friend?.name || friendId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入聊天记录
  const importChatHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      alert('请选择JSON格式的聊天记录文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        // 验证导入数据格式
        if (!importData.chatHistory && !importData.messages) {
          alert('文件格式错误：缺少聊天记录数据');
          return;
        }
        
        let importedHistory: {[friendId: string]: ChatMessage[]} = {};
        let importedCount = 0;
        
        if (importData.chatHistory) {
          // 全部聊天记录导入
          Object.keys(importData.chatHistory).forEach(friendId => {
            const messages = importData.chatHistory[friendId].map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            importedHistory[friendId] = messages;
            importedCount += messages.length;
          });
        } else if (importData.messages && importData.friend) {
          // 单个好友聊天记录导入
          const friendId = importData.friend.id;
          const messages = importData.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          importedHistory[friendId] = messages;
          importedCount = messages.length;
        }
        
        if (importedCount === 0) {
          alert('导入的文件中没有有效的聊天记录');
          return;
        }
        
        // 询问用户是否要合并还是覆盖
        const shouldMerge = confirm(
          `检测到 ${importedCount} 条聊天记录。\n\n点击"确定"合并到现有记录\n点击"取消"覆盖现有记录`
        );
        
        let newChatHistory: {[friendId: string]: ChatMessage[]};
        
        if (shouldMerge) {
          // 合并模式：将导入的记录添加到现有记录中
          newChatHistory = { ...chatHistory };
          Object.keys(importedHistory).forEach(friendId => {
            if (newChatHistory[friendId]) {
              // 合并消息并按时间排序
              const combinedMessages = [...newChatHistory[friendId], ...importedHistory[friendId]];
              combinedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
              newChatHistory[friendId] = combinedMessages;
            } else {
              newChatHistory[friendId] = importedHistory[friendId];
            }
          });
        } else {
          // 覆盖模式：完全替换聊天记录
          newChatHistory = importedHistory;
        }
        
        setChatHistory(newChatHistory);
        localStorage.setItem('chatHistory', JSON.stringify(newChatHistory));
        
        alert(`成功导入 ${importedCount} 条聊天记录！`);
        
      } catch (error) {
        console.error('导入聊天记录失败:', error);
        alert('文件格式错误，请检查文件内容');
      }
    };
    
    reader.readAsText(file, 'UTF-8');
    event.target.value = ''; // 清空input
  };

  // 删除用户编码
  const deleteUserEncoding = (key: string) => {
    const newEncodings = { ...userEncodings };
    delete newEncodings[key];
    saveUserEncodings(newEncodings);
  };

  // 开始编辑编码
  const startEditEncoding = (key?: string) => {
    if (key && userEncodings[key]) {
      // 编辑现有编码
      setEditingKey(key);
      setEditingEncoding({
        name: userEncodings[key].name,
        description: userEncodings[key].description,
        chars: [...userEncodings[key].chars]
      });
    } else {
      // 创建新编码，使用当前选中的编码作为初始值
      const currentPreset = ENCODING_PRESETS[selectedFriend as keyof typeof ENCODING_PRESETS] || userEncodings[selectedFriend];
      setEditingKey(null);
      setEditingEncoding({
        name: currentPreset ? `${currentPreset.name} - 副本` : '',
        description: currentPreset ? currentPreset.description : '',
        chars: currentPreset ? [...currentPreset.chars] : Array(64).fill('')
      });
    }
    setShowEditEncoding(true);
    setShowImportExport(false);
  };

  // 保存编辑的编码
  const saveEditedEncoding = () => {
    if (!editingEncoding.name.trim()) {
      alert('请输入编码名称');
      return;
    }
    
    if (!editingEncoding.description.trim()) {
      alert('请输入编码描述');
      return;
    }
    
    const filledChars = editingEncoding.chars.filter(c => c.trim());
    if (filledChars.length !== 64) {
      alert(`字符集必须包含64个字符，当前有${filledChars.length}个`);
      return;
    }
    
    const key = editingKey || `user_${Date.now()}`;
    const newEncodings = {
      ...userEncodings,
      [key]: {
        ...editingEncoding,
        chars: editingEncoding.chars,
        avatar: '✏️'
      }
    };
    
    saveUserEncodings(newEncodings);
    setShowEditEncoding(false);
    alert(`${editingKey ? '编辑' : '创建'}编码成功：${editingEncoding.name}`);
  };

  // 取消编辑
  const cancelEdit = () => {
    setShowEditEncoding(false);
    setEditingKey(null);
  };

  // 编码消息
  const encodeMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `原文: ${inputText}`,
      timestamp: new Date(),
      isEncoded: false  // 编码操作用蓝色
    };

    const messagesWithUser = [...messages, userMessage];
    updateMessages(messagesWithUser);

    try {
      const encoded = encode(inputText, currentPreset.chars);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: encoded,
        timestamp: new Date(),
        encoding: `${currentPreset.name}编码`,
        isEncoded: false  // 编码回复用蓝色
      };
      updateMessages([...messagesWithUser, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `编码失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date()
      };
      updateMessages([...messagesWithUser, errorMessage]);
    }

    setInputText('');
  };

  // 解码消息
  const decodeInputMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `编码文本: ${inputText}`,
      timestamp: new Date(),
      isEncoded: true   // 解码操作用绿色
    };

    const messagesWithUser = [...messages, userMessage];
    updateMessages(messagesWithUser);

    try {
      const decoded = decode(inputText, currentPreset.chars);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: decoded,
        timestamp: new Date(),
        encoding: `${currentPreset.name}解码`,
        isEncoded: true   // 解码回复用绿色
      };
      updateMessages([...messagesWithUser, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `解码失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date()
      };
      updateMessages([...messagesWithUser, errorMessage]);
    }

    setInputText('');
  };



  return (
    <div className="flex h-screen bg-gray-100">
      {/* 编辑编码弹窗 */}
      {showEditEncoding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingKey ? '编辑编码' : '创建新编码'}</h2>
            
            {/* 基本信息 */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">编码名称</label>
                <input
                  type="text"
                  value={editingEncoding.name}
                  onChange={(e) => setEditingEncoding({...editingEncoding, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入编码名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">编码描述</label>
                <input
                  type="text"
                  value={editingEncoding.description}
                  onChange={(e) => setEditingEncoding({...editingEncoding, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入编码描述"
                />
              </div>
            </div>
            
            {/* 字符集编辑 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">字符集 (64个字符)</label>
              <div className="grid grid-cols-8 gap-1">
                {editingEncoding.chars.map((char, index) => (
                  <input
                    key={index}
                    type="text"
                    value={char}
                    onChange={(e) => {
                      const newChars = [...editingEncoding.chars];
                      newChars[index] = e.target.value; // 允许多字符字符串
                      setEditingEncoding({...editingEncoding, chars: newChars});
                    }}
                    className="w-full h-10 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder={index.toString()}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                已填写: {editingEncoding.chars.filter(c => c.trim()).length}/64
              </p>
            </div>
            
            {/* 快速填充按钮 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">快速填充</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const standardChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
                    setEditingEncoding({...editingEncoding, chars: standardChars});
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  标准Base64
                </button>
                <button
                  onClick={() => {
                    const newChars = Array(64).fill('');
                    setEditingEncoding({...editingEncoding, chars: newChars});
                  }}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  清空
                </button>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={saveEditedEncoding}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 左侧好友列表 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">彩色Base64聊天</h2>
          <p className="text-sm text-gray-600 mt-1">选择编码好友开始聊天</p>
          
          {/* 导入导出按钮 */}
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => setShowImportExport(!showImportExport)}
              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
            >
              <span>⚙️</span>
              <span>编码管理</span>
            </button>
          </div>
        </div>
        
        {/* 编码管理面板 */}
        {showImportExport && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-800 mb-3">编码管理</h3>
            
            {/* 编码管理 */}
             <div className="mb-3 space-y-2">
               <label className="block">
                 <input
                   type="file"
                   accept=".txt"
                   onChange={handleFileUpload}
                   className="hidden"
                 />
                 <div className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors cursor-pointer text-center">
                   📁 导入编码文件
                 </div>
               </label>
               
               <button
                  onClick={() => startEditEncoding(selectedFriend)}
                  className="w-full px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                >
                  ✏️ 编辑编码
                </button>
             </div>
             
             {/* 聊天记录管理 */}
             <div className="mb-3 space-y-2">
               <h4 className="text-xs font-medium text-gray-600 mb-2">聊天记录管理</h4>
               
               <button
                 onClick={exportAllChatHistory}
                 className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
               >
                 📤 导出全部聊天记录
               </button>
               
               <label className="block">
                 <input
                   type="file"
                   accept=".json"
                   onChange={importChatHistory}
                   className="hidden"
                 />
                 <div className="w-full px-3 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors cursor-pointer text-center">
                   📥 导入聊天记录
                 </div>
               </label>
             </div>
            
            {/* 用户编码列表 */}
            {Object.keys(userEncodings).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2">我的编码</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(userEncodings).map(([key, encoding]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                      <span className="truncate flex-1">{encoding.name}</span>
                      <div className="flex space-x-1 ml-2">
                         <button
                           onClick={() => startEditEncoding(key)}
                           className="text-purple-500 hover:text-purple-700"
                           title="编辑"
                         >
                           ✏️
                         </button>
                         <button
                           onClick={() => exportUserEncoding(encoding)}
                           className="text-blue-500 hover:text-blue-700"
                           title="导出"
                         >
                           💾
                         </button>
                         <button
                           onClick={() => {
                             if (confirm(`确定要删除编码 "${encoding.name}" 吗？`)) {
                               deleteUserEncoding(key);
                             }
                           }}
                           className="text-red-500 hover:text-red-700"
                           title="删除"
                         >
                           🗑️
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => {
                setSelectedFriend(friend.id);
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedFriend === friend.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                    {friend.avatar}
                  </div>
                  {friend.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 truncate">{friend.name}</h3>
                    {chatHistory[friend.id] && chatHistory[friend.id].length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        最近
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{friend.description}</p>
                  {chatHistory[friend.id] && chatHistory[friend.id].length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      最后聊天: {getLastChatTime(friend.id).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const preset = ENCODING_PRESETS[friend.id as keyof typeof ENCODING_PRESETS] || userEncodings[friend.id];
                      if (preset) {
                        exportUserEncoding(preset);
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm p-1"
                    title="导出编码"
                  >
                    💾
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 设置面板 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">压缩模式</label>
              <div className="mt-1 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="compression"
                    value="smart"
                    checked={compressionMode === 'smart'}
                    onChange={(e) => setCompressionMode(e.target.value as 'smart' | 'none')}
                    className="mr-2"
                  />
                  <span className="text-sm">智能压缩</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="compression"
                    value="none"
                    checked={compressionMode === 'none'}
                    onChange={(e) => setCompressionMode(e.target.value as 'smart' | 'none')}
                    className="mr-2"
                  />
                  <span className="text-sm">不压缩</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useSmartSeparator}
                  onChange={(e) => setUseSmartSeparator(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">智能分隔符</span>
              </label>
              {!useSmartSeparator && (
                <input
                  type="text"
                  value={customSeparator}
                  onChange={(e) => setCustomSeparator(e.target.value)}
                  className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="自定义分隔符"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="p-4 bg-white border-b border-gray-200">
          {currentFriend && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                  {currentFriend.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{currentFriend.name}</h2>
                  <p className="text-sm text-gray-500">{currentFriend.description}</p>
                </div>
              </div>
              {messages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportFriendChatHistory(selectedFriend)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="导出聊天记录"
                  >
                    💾 导出
                  </button>
                  <button
                    onClick={clearCurrentChat}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="清空聊天记录"
                  >
                    🗑️ 清空
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ComputerDesktopIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>开始与 {currentFriend?.name} 聊天吧！</p>
              <p className="text-sm mt-1">发送文本消息，我会用 {currentFriend?.name} 编码回复你</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="relative group">
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? message.isEncoded
                          ? 'bg-green-500 text-white'  // 解码消息用绿色
                          : 'bg-blue-500 text-white'   // 编码消息用蓝色
                        : message.isEncoded
                          ? 'bg-green-100 border border-green-300 text-green-900'  // 解码回复用浅绿色
                          : 'bg-blue-100 border border-blue-300 text-blue-900'     // 编码回复用浅蓝色
                    }`}
                  >
                    <div className="break-words">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' 
                        ? message.isEncoded
                          ? 'text-green-100'  // 解码消息时间戳用浅绿色
                          : 'text-blue-100'   // 编码消息时间戳用浅蓝色
                        : message.isEncoded
                          ? 'text-green-600'  // 解码回复时间戳用深绿色
                          : 'text-blue-600'   // 编码回复时间戳用深蓝色
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                      {message.encoding && ` · ${message.encoding}`}
                    </div>
                  </div>
                  
                  {/* 复制按钮 */}
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className={`absolute top-2 ${
                      message.type === 'user' ? 'left-2' : 'right-2'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded ${
                      message.type === 'user'
                        ? 'hover:bg-white hover:bg-opacity-20'
                        : 'hover:bg-gray-200'
                    }`}
                    title="复制消息"
                  >
                    <ClipboardDocumentIcon className={`w-4 h-4 ${
                      message.type === 'user'
                        ? 'text-white'
                        : message.isEncoded
                          ? 'text-green-600'
                          : 'text-blue-600'
                    }`} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 输入区域 */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && encodeMessage()}
              placeholder={`向 ${currentFriend?.name} 发送消息...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={encodeMessage}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              title="编码"
            >
              <CodeBracketIcon className="w-5 h-5" />
              <span className="text-sm">编码</span>
            </button>
            <button
              onClick={decodeInputMessage}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              title="解码"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span className="text-sm">解码</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
