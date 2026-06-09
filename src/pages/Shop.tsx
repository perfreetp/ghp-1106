import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, Gem, Sparkles, ShoppingCart, X, Check, RefreshCw, Clock, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/common/GameButton';
import { HeroAvatar } from '@/components/common/HeroAvatar';
import { Modal } from '@/components/common/Modal';
import { useGameStore } from '@/store/useGameStore';
import { heroes } from '@/data/heroes';
import { equipmentList } from '@/data/equipment';
import { inscriptions } from '@/data/inscriptions';

type ShopTab = 'hero' | 'equipment' | 'inscription' | 'daily';

interface CartItem {
  id: string;
  type: 'hero' | 'equipment' | 'inscription';
  name: string;
  price: number;
  emoji: string;
  count: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface DailyDeal {
  id: string;
  type: 'hero' | 'equipment' | 'inscription';
  name: string;
  emoji: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
}

const getHeroPrice = (star: number) => {
  const prices: Record<number, number> = {
    1: 1000,
    2: 2500,
    3: 5000,
    4: 10000,
    5: 20000,
    6: 50000,
  };
  return prices[star] || 5000;
};

const getEquipmentQualityStyle = (category: string) => {
  const styles: Record<string, { border: string; bg: string; glow: string }> = {
    weapon: { border: 'border-red-500/60', bg: 'from-red-950/60 to-red-900/30', glow: 'shadow-red-500/20' },
    armor: { border: 'border-blue-500/60', bg: 'from-blue-950/60 to-blue-900/30', glow: 'shadow-blue-500/20' },
    boots: { border: 'border-green-500/60', bg: 'from-green-950/60 to-green-900/30', glow: 'shadow-green-500/20' },
    accessory: { border: 'border-purple-500/60', bg: 'from-purple-950/60 to-purple-900/30', glow: 'shadow-purple-500/20' },
  };
  return styles[category] || styles.weapon;
};

const getInscriptionColorStyle = (color: string) => {
  const styles: Record<string, { border: string; bg: string; glow: string; text: string }> = {
    red: { border: 'border-red-500/60', bg: 'from-red-950/60 to-red-900/30', glow: 'shadow-red-500/30', text: 'text-red-300' },
    blue: { border: 'border-blue-500/60', bg: 'from-blue-950/60 to-blue-900/30', glow: 'shadow-blue-500/30', text: 'text-blue-300' },
    green: { border: 'border-green-500/60', bg: 'from-green-950/60 to-green-900/30', glow: 'shadow-green-500/30', text: 'text-green-300' },
  };
  return styles[color] || styles.red;
};

const equipmentEmojiMap: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  boots: '👢',
  accessory: '💎',
};

const inscriptionEmojiMap: Record<string, string> = {
  red: '🔴',
  blue: '🔵',
  green: '🟢',
};

export default function Shop() {
  const [activeTab, setActiveTab] = useState<ShopTab>('hero');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<'hero' | 'equipment' | 'inscription' | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmItem, setConfirmItem] = useState<{ id: string; name: string; price: number; type: string } | null>(null);
  const [heroFragments] = useState(128);
  const [dailyDeals, setDailyDeals] = useState<DailyDeal[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [ownedEquipment, setOwnedEquipment] = useState<string[]>([]);
  const [ownedInscriptions, setOwnedInscriptions] = useState<Record<string, number>>({});

  const { gold, diamond, heroInstances, addHero, spendGold } = useGameStore();

  useEffect(() => {
    const saved = localStorage.getItem('shop_daily_deals');
    const savedDate = localStorage.getItem('shop_daily_date');
    const today = new Date().toDateString();

    if (saved && savedDate === today) {
      setDailyDeals(JSON.parse(saved));
    } else {
      generateDailyDeals();
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - Date.now();
    setCountdown(Math.floor(diff / 1000));

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          generateDailyDeals();
          const t = new Date();
          t.setDate(t.getDate() + 1);
          t.setHours(0, 0, 0, 0);
          return Math.floor((t.getTime() - Date.now()) / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const generateDailyDeals = () => {
    const allItems: DailyDeal[] = [];

    const shuffledHeroes = [...heroes].sort(() => Math.random() - 0.5).slice(0, 1);
    shuffledHeroes.forEach((h) => {
      const star = Math.floor(Math.random() * 3) + 2;
      const original = getHeroPrice(star);
      const discount = Math.floor(Math.random() * 30) + 20;
      allItems.push({
        id: h.id,
        type: 'hero',
        name: h.name,
        emoji: h.avatar,
        originalPrice: original,
        discountPrice: Math.floor(original * (100 - discount) / 100),
        discount,
      });
    });

    const shuffledEquip = [...equipmentList].sort(() => Math.random() - 0.5).slice(0, 1);
    shuffledEquip.forEach((e) => {
      const discount = Math.floor(Math.random() * 25) + 15;
      allItems.push({
        id: e.id,
        type: 'equipment',
        name: e.name,
        emoji: equipmentEmojiMap[e.category] || '🎁',
        originalPrice: e.price,
        discountPrice: Math.floor(e.price * (100 - discount) / 100),
        discount,
      });
    });

    const shuffledIns = [...inscriptions].sort(() => Math.random() - 0.5).slice(0, 1);
    shuffledIns.forEach((i) => {
      const original = 800;
      const discount = Math.floor(Math.random() * 35) + 20;
      allItems.push({
        id: i.id,
        type: 'inscription',
        name: i.name,
        emoji: inscriptionEmojiMap[i.color] || '💠',
        originalPrice: original,
        discountPrice: Math.floor(original * (100 - discount) / 100),
        discount,
      });
    });

    setDailyDeals(allItems);
    localStorage.setItem('shop_daily_deals', JSON.stringify(allItems));
    localStorage.setItem('shop_daily_date', new Date().toDateString());
  };

  const ownedHeroTemplateIds = useMemo(() => {
    return new Set(heroInstances.map((h) => h.templateId));
  }, [heroInstances]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, count: i.count + item.count } : i));
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateCartCount = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newCount = i.count + delta;
            return newCount > 0 ? { ...i, count: newCount } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.count, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.count, 0);

  const handleBuyItem = (id: string, name: string, price: number, type: string, count: number = 1) => {
    const totalPrice = price * count;
    if (gold < totalPrice) {
      addToast('金币不足！', 'error');
      return;
    }
    setConfirmItem({ id, name, price: totalPrice, type });
  };

  const confirmBuy = () => {
    if (!confirmItem) return;

    const success = spendGold(confirmItem.price);
    if (!success) {
      addToast('金币不足！', 'error');
      setConfirmItem(null);
      return;
    }

    if (confirmItem.type === 'hero') {
      addHero(confirmItem.id);
      addToast(`成功购买英雄：${confirmItem.name}！`, 'success');
    } else if (confirmItem.type === 'equipment') {
      setOwnedEquipment((prev) => [...prev, confirmItem.id]);
      addToast(`成功购买装备：${confirmItem.name}！`, 'success');
    } else if (confirmItem.type === 'inscription') {
      setOwnedInscriptions((prev) => ({
        ...prev,
        [confirmItem.id]: (prev[confirmItem.id] || 0) + 1,
      }));
      addToast(`成功购买铭文：${confirmItem.name}！`, 'success');
    } else if (confirmItem.type === 'cart') {
      const deal = dailyDeals.find((d) => d.id === confirmItem.id);
      if (deal) {
        if (deal.type === 'hero') addHero(deal.id);
        else if (deal.type === 'equipment') {
          setOwnedEquipment((prev) => [...prev, deal.id]);
        } else if (deal.type === 'inscription') {
          setOwnedInscriptions((prev) => ({
            ...prev,
            [deal.id]: (prev[deal.id] || 0) + 1,
          }));
        }
        addToast(`成功购买特惠商品：${deal.name}！`, 'success');
      }
    }

    setConfirmItem(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (gold < cartTotal) {
      addToast('金币不足！', 'error');
      return;
    }
    setConfirmItem({ id: 'cart', name: '购物车结算', price: cartTotal, type: 'cart_checkout' });
  };

  const confirmCheckout = () => {
    const success = spendGold(cartTotal);
    if (!success) {
      addToast('金币不足！', 'error');
      setConfirmItem(null);
      return;
    }

    cart.forEach((item) => {
      for (let i = 0; i < item.count; i++) {
        if (item.type === 'hero') addHero(item.id);
        else if (item.type === 'equipment') {
          setOwnedEquipment((prev) => [...prev, item.id]);
        } else if (item.type === 'inscription') {
          setOwnedInscriptions((prev) => ({
            ...prev,
            [item.id]: (prev[item.id] || 0) + 1,
          }));
        }
      }
    });

    addToast(`结算成功！共购买 ${cartCount} 件商品`, 'success');
    setCart([]);
    setShowCart(false);
    setConfirmItem(null);
  };

  const tabs = [
    { key: 'hero' as ShopTab, label: '英雄商店', icon: '⚔️' },
    { key: 'equipment' as ShopTab, label: '装备商店', icon: '🛡️' },
    { key: 'inscription' as ShopTab, label: '铭文商店', icon: '💠' },
    { key: 'daily' as ShopTab, label: '每日特惠', icon: '🎁' },
  ];

  const renderHeroShop = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {heroes.map((hero) => {
        const owned = ownedHeroTemplateIds.has(hero.id);
        const star = 3;
        const price = getHeroPrice(star);

        return (
          <motion.div
            key={hero.id}
            className={cn(
              'relative rounded-2xl p-4 border-2 cursor-pointer',
              'bg-gradient-to-br from-slate-900/80 to-slate-950/60',
              'shadow-lg transition-all duration-200',
              owned
                ? 'border-gray-600/40 opacity-60 grayscale'
                : 'border-yellow-500/30 hover:border-yellow-400/60 hover:shadow-yellow-500/20 hover:-translate-y-1',
            )}
            whileHover={!owned ? { scale: 1.02 } : undefined}
            onClick={() => {
              setDetailItem(hero);
              setDetailType('hero');
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <HeroAvatar
                avatar={hero.avatar}
                name={hero.name}
                role={hero.className}
                star={star}
                size="lg"
              />
              <h3 className="text-white font-bold text-sm mt-1">{hero.name}</h3>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                'bg-gradient-to-r from-purple-600/40 to-blue-600/40',
                'border border-purple-400/30 text-purple-200',
              )}>
                {hero.className}
              </span>
              <p className="text-slate-400 text-xs text-center line-clamp-2 mt-1 h-8">
                {hero.description}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 font-bold text-sm">{price.toLocaleString()}</span>
              </div>
              <span onClick={(e) => e.stopPropagation()}>
                <GameButton
                  size="sm"
                  variant={owned ? 'secondary' : 'primary'}
                  disabled={owned}
                  onClick={() => {
                    if (!owned) handleBuyItem(hero.id, hero.name, price, 'hero');
                  }}
                  className="w-full"
                >
                  {owned ? '已拥有' : '购买'}
                </GameButton>
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderEquipmentShop = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {equipmentList.map((equip) => {
        const style = getEquipmentQualityStyle(equip.category);
        const owned = ownedEquipment.includes(equip.id);

        return (
          <motion.div
            key={equip.id}
            className={cn(
              'relative rounded-2xl p-4 border-2 cursor-pointer',
              'bg-gradient-to-br', style.bg,
              'shadow-lg transition-all duration-200',
              style.border, style.glow,
              'hover:shadow-lg hover:-translate-y-1',
            )}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setDetailItem(equip);
              setDetailType('equipment');
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'w-20 h-20 rounded-xl flex items-center justify-center',
                'bg-gradient-to-br from-black/40 to-black/20',
                'border border-white/10',
              )}>
                <span className="text-5xl drop-shadow-lg">{equipmentEmojiMap[equip.category]}</span>
              </div>
              <h3 className="text-white font-bold text-sm mt-1">{equip.name}</h3>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                'bg-black/30 border border-white/10 text-slate-200',
              )}>
                {equip.categoryName}
              </span>
              <p className="text-slate-400 text-xs text-center line-clamp-2 mt-1 h-8">
                {equip.description}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 font-bold text-sm">{equip.price.toLocaleString()}</span>
              </div>
              <span onClick={(e) => e.stopPropagation()}>
                <GameButton
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    handleBuyItem(equip.id, equip.name, equip.price, 'equipment');
                  }}
                  className="w-full"
                >
                  {owned ? '再次购买' : '购买'}
                </GameButton>
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderInscriptionShop = () => (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <GameButton
          size="sm"
          variant="secondary"
          onClick={() => handleBuyItem('random_single', '随机铭文', 400, 'inscription')}
        >
          🎲 单抽 (400金币)
        </GameButton>
        <GameButton
          size="sm"
          variant="primary"
          onClick={() => handleBuyItem('random_ten', '铭文十连', 3600, 'inscription', 10)}
        >
          🎰 十连抽 (3600金币)
        </GameButton>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {inscriptions.map((ins) => {
          const style = getInscriptionColorStyle(ins.color);
          const ownedCount = ownedInscriptions[ins.id] || 0;

          return (
            <motion.div
              key={ins.id}
              className={cn(
                'relative rounded-xl p-3 border-2 cursor-pointer',
                'bg-gradient-to-br', style.bg,
                'shadow-lg transition-all duration-200',
                style.border, style.glow,
                'hover:shadow-lg hover:-translate-y-1',
              )}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setDetailItem(ins);
                setDetailType('inscription');
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-14 h-14 rounded-lg flex items-center justify-center',
                  'bg-black/40 border border-white/10',
                )}>
                  <span className="text-3xl">{inscriptionEmojiMap[ins.color]}</span>
                </div>
                <h3 className="text-white font-bold text-xs mt-1">{ins.name}</h3>
                <span className={cn('text-xs', style.text)}>{ins.colorName}</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-300 font-bold text-xs">800</span>
                </div>
                {ownedCount > 0 && (
                  <span className="text-slate-300 text-[10px]">已拥有 x{ownedCount}</span>
                )}
                <span onClick={(e) => e.stopPropagation()}>
                  <GameButton
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      handleBuyItem(ins.id, ins.name, 800, 'inscription');
                    }}
                    className="w-full !py-1 !text-xs"
                  >
                    购买
                  </GameButton>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderDailyDeals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-900/40 via-red-900/40 to-orange-900/40 rounded-xl p-4 border border-orange-500/30">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" style={{ animationDuration: '3s' }} />
          <div>
            <h3 className="text-orange-200 font-bold">每日特惠</h3>
            <p className="text-orange-300/70 text-xs">每天0点刷新，折扣商品限时抢购</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          <span className="text-orange-300 font-mono text-lg font-bold tabular-nums">
            {formatCountdown(countdown)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dailyDeals.map((deal) => {
          const style = deal.type === 'hero'
            ? getEquipmentQualityStyle('weapon')
            : deal.type === 'equipment'
            ? getEquipmentQualityStyle('accessory')
            : { border: 'border-cyan-500/60', bg: 'from-cyan-950/60 to-cyan-900/30', glow: 'shadow-cyan-500/20' };

          return (
            <motion.div
              key={deal.id}
              className={cn(
                'relative rounded-2xl p-6 border-2 overflow-hidden',
                'bg-gradient-to-br', style.bg,
                style.border, style.glow,
                'shadow-2xl',
              )}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-red-500/20 blur-xl" />
              <div className="absolute top-3 right-3">
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                  -{deal.discount}%
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-28 h-28 rounded-2xl flex items-center justify-center bg-black/40 border-2 border-white/20 shadow-inner">
                  <span className="text-7xl drop-shadow-2xl">{deal.emoji}</span>
                </div>
                <h3 className="text-white font-bold text-xl">{deal.name}</h3>
                <span className="text-slate-300 text-sm capitalize">
                  {deal.type === 'hero' ? '英雄' : deal.type === 'equipment' ? '装备' : '铭文'}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400 line-through text-sm">
                      {deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300 font-bold text-xl">
                      {deal.discountPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <GameButton
                  size="lg"
                  variant="danger"
                  onClick={() => handleBuyItem(deal.id, deal.name, deal.discountPrice, 'cart')}
                  className="w-full"
                >
                  ⚡ 立即抢购
                </GameButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderDetailModal = () => {
    if (!detailItem || !detailType) return null;

    return (
      <Modal
        isOpen={!!detailItem}
        onClose={() => {
          setDetailItem(null);
          setDetailType(null);
        }}
        title={detailItem.name}
        size="lg"
        footer={
          detailType === 'hero' ? (
            <GameButton
              variant="primary"
              size="lg"
              disabled={ownedHeroTemplateIds.has(detailItem.id)}
              onClick={() => {
                const price = getHeroPrice(3);
                handleBuyItem(detailItem.id, detailItem.name, price, 'hero');
                setDetailItem(null);
                setDetailType(null);
              }}
              className="w-full"
            >
              {ownedHeroTemplateIds.has(detailItem.id) ? '已拥有' : `购买 (${getHeroPrice(3).toLocaleString()} 金币)`}
            </GameButton>
          ) : detailType === 'equipment' ? (
            <GameButton
              variant="primary"
              size="lg"
              onClick={() => {
                handleBuyItem(detailItem.id, detailItem.name, detailItem.price, 'equipment');
                setDetailItem(null);
                setDetailType(null);
              }}
              className="w-full"
            >
              购买 ({detailItem.price.toLocaleString()} 金币)
            </GameButton>
          ) : (
            <GameButton
              variant="primary"
              size="lg"
              onClick={() => {
                handleBuyItem(detailItem.id, detailItem.name, 800, 'inscription');
                setDetailItem(null);
                setDetailType(null);
              }}
              className="w-full"
            >
              购买 (800 金币)
            </GameButton>
          )
        }
      >
        {detailType === 'hero' && (
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              <HeroAvatar
                avatar={detailItem.avatar}
                name={detailItem.name}
                role={detailItem.className}
                star={3}
                size="xl"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-400/40 text-purple-200 text-sm">
                    {detailItem.className}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-200 text-sm">
                    3星
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{detailItem.description}</p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {Object.entries(detailItem.baseStats).map(([key, value]) => (
                    <div key={key} className="flex justify-between bg-black/30 rounded-lg px-3 py-2">
                      <span className="text-slate-400 text-sm">
                        {key === 'maxHp' ? '生命' : key === 'maxMana' ? '法力' : key === 'attack' ? '攻击' : key === 'defense' ? '防御' : '速度'}
                      </span>
                      <span className="text-white font-bold">{value as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {detailType === 'equipment' && (
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              <div className={cn(
                'w-28 h-28 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br from-black/50 to-black/30 border-2 border-white/20',
              )}>
                <span className="text-7xl">{equipmentEmojiMap[detailItem.category]}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-600/30 border border-slate-400/40 text-slate-200 text-sm">
                    {detailItem.categoryName}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{detailItem.description}</p>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 space-y-2">
              <h4 className="text-yellow-400 font-bold mb-2">属性加成</h4>
              {detailItem.attributes?.map((attr: any, idx: number) => (
                <div key={idx} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                  <span className="text-slate-300">{attr.name}</span>
                  <span className="text-green-400 font-bold">+{attr.value}{attr.name.includes('率') || attr.name.includes('效果') || attr.name.includes('吸血') || attr.name.includes('穿透') || attr.name.includes('缩减') ? '%' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {detailType === 'inscription' && (
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              <div className={cn(
                'w-28 h-28 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br from-black/50 to-black/30 border-2 border-white/20',
              )}>
                <span className="text-7xl">{inscriptionEmojiMap[detailItem.color]}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'px-3 py-1 rounded-full border text-sm',
                    detailItem.color === 'red' ? 'bg-red-600/30 border-red-400/40 text-red-200' :
                    detailItem.color === 'blue' ? 'bg-blue-600/30 border-blue-400/40 text-blue-200' :
                    'bg-green-600/30 border-green-400/40 text-green-200',
                  )}>
                    {detailItem.colorName} · Lv.{detailItem.level}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{detailItem.description}</p>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 space-y-2">
              <h4 className="text-yellow-400 font-bold mb-2">属性加成</h4>
              {detailItem.attributes?.map((attr: any, idx: number) => (
                <div key={idx} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                  <span className="text-slate-300">{attr.name}</span>
                  <span className="text-green-400 font-bold">+{attr.value}{attr.name.includes('率') || attr.name.includes('效果') || attr.name.includes('吸血') || attr.name.includes('穿透') || attr.name.includes('缩减') || attr.name.includes('回复') ? '%' : ''}</span>
                </div>
              ))}
            </div>
            {ownedInscriptions[detailItem.id] > 0 && (
              <div className="text-center text-slate-400 text-sm">
                当前拥有数量：<span className="text-white font-bold">{ownedInscriptions[detailItem.id]}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              className="p-3 rounded-xl bg-slate-800/60 border border-white/10 text-white hover:bg-slate-700/60 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                🏪 王者商店
              </h1>
              <p className="text-slate-400 text-sm mt-1">收集强力装备，打造无敌阵容</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/40 to-amber-900/40 px-4 py-2 rounded-xl border border-yellow-500/30">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200 font-bold tabular-nums">{gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 px-4 py-2 rounded-xl border border-cyan-500/30">
              <Gem className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-200 font-bold tabular-nums">{diamond.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-900/40 to-rose-900/40 px-4 py-2 rounded-xl border border-pink-500/30">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-pink-200 font-bold tabular-nums">{heroFragments}</span>
            </div>
            <motion.button
              className="relative p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-2 border-purple-400/50 shadow-lg shadow-purple-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1.5 bg-black/30 rounded-2xl border border-white/10 backdrop-blur-sm w-fit">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              className={cn(
                'relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2',
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 shadow-lg shadow-yellow-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5',
              )}
              onClick={() => setActiveTab(tab.key)}
              whileHover={activeTab !== tab.key ? { scale: 1.02 } : undefined}
              whileTap={{ scale: 0.98 }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/60 rounded-full"
                  layoutId="tabIndicator"
                />
              )}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'hero' && renderHeroShop()}
          {activeTab === 'equipment' && renderEquipmentShop()}
          {activeTab === 'inscription' && renderInscriptionShop()}
          {activeTab === 'daily' && renderDailyDeals()}
        </motion.div>
      </div>

      <Modal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title="🛒 购物车"
        size="lg"
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">总计：</span>
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-2xl tabular-nums">
                {cartTotal.toLocaleString()}
              </span>
            </div>
            <GameButton
              variant="primary"
              size="lg"
              disabled={cart.length === 0 || gold < cartTotal}
              onClick={handleCheckout}
            >
              结算 ({cartCount} 件)
            </GameButton>
          </div>
        }
      >
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">购物车是空的，快去选购吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/10">
                  <span className="text-3xl">{item.emoji}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{item.name}</h4>
                  <div className="flex items-center gap-1 text-sm">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-yellow-300">{item.price.toLocaleString()}</span>
                    <span className="text-slate-500 mx-1">×</span>
                    <span className="text-slate-300">{item.count}</span>
                    <span className="text-slate-500">=</span>
                    <span className="text-orange-300 font-bold">
                      {(item.price * item.count).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateCartCount(item.id, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-white font-bold w-8 text-center">{item.count}</span>
                  <motion.button
                    className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateCartCount(item.id, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <motion.button
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromCart(item.id)}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        title="确认购买"
        size="sm"
        footer={
          <div className="flex gap-3">
            <GameButton
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmItem(null)}
            >
              取消
            </GameButton>
            <GameButton
              variant="primary"
              className="flex-1"
              onClick={confirmItem?.type === 'cart_checkout' ? confirmCheckout : confirmBuy}
            >
              确认购买
            </GameButton>
          </div>
        }
      >
        <div className="text-center space-y-4 py-4">
          <div className="text-6xl">🛒</div>
          <div className="space-y-2">
            <p className="text-white font-bold text-lg">{confirmItem?.name}</p>
            {gold < (confirmItem?.price || 0) && (
              <p className="text-red-400 text-sm animate-pulse">⚠️ 金币不足！</p>
            )}
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-2xl tabular-nums">
                {confirmItem?.price.toLocaleString()}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              当前余额：
              <span className={cn(
                'font-bold ml-1',
                gold >= (confirmItem?.price || 0) ? 'text-green-400' : 'text-red-400',
              )}>
                {gold.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </Modal>

      {renderDetailModal()}

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl pointer-events-auto',
                'border-2 backdrop-blur-xl',
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500/50'
                  : 'bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-500/50',
              )}
            >
              {toast.type === 'success' ? (
                <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
              ) : (
                <X className="w-6 h-6 text-red-400 flex-shrink-0" />
              )}
              <span className={cn(
                'font-bold drop-shadow-md',
                toast.type === 'success' ? 'text-green-100' : 'text-red-100',
              )}>
                {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
