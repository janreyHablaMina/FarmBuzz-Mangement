import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SALES_HERO_IMAGE = require('./assets/sales-hero.png');
const INCUBATING_EGGS_IMAGE = require('./assets/incubation-stage-developing.png');
const HATCHED_CHICKS_IMAGE = require('./assets/incubation-stage-hatched.png');

const ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=300&q=82';
const BLACK_ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=300&q=82';
const HEN_IMAGE =
  'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=300&q=82';
const LISTING_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sale', label: 'For Sale' },
  { id: 'reserve', label: 'Reserve' },
  { id: 'sold', label: 'Sold' },
];

const TRANSACTIONS = [
  {
    id: 'SL-1042', item: 'Razor 014', category: 'Kelso Cock', owner: 'Miguel Dela Cruz',
    date: 'Aug 28, 2024', type: 'Sold', price: '₱28,000', status: 'Confirmed', image: ROOSTER_IMAGE,
  },
  {
    id: 'SL-1041', item: 'Storm 057', category: 'Hatch Cock', owner: 'Ramon Garcia',
    date: 'Aug 26, 2024', type: 'Transferred', price: 'No sale', status: 'Confirmed', image: BLACK_ROOSTER_IMAGE,
  },
  {
    id: 'SL-1040', item: 'Queen 033', category: 'Kelso Hen', owner: 'Paolo Mendoza',
    date: 'Aug 24, 2024', type: 'Sold', price: '₱18,500', status: 'Pending', image: HEN_IMAGE,
  },
  {
    id: 'SL-1039', item: 'Blade 008', category: 'Roundhead Cock', owner: 'Noel Bautista',
    date: 'Aug 20, 2024', type: 'Transferred', price: 'No sale', status: 'Confirmed', image: BLACK_ROOSTER_IMAGE,
  },
  {
    id: 'SL-1038', item: 'Ruby 052', category: 'Roundhead Hen', owner: 'Erwin Ramos',
    date: 'Aug 18, 2024', type: 'Sold', price: '₱12,000', status: 'Pending', image: HEN_IMAGE,
  },
];

const FOR_SALE_BIRDS = [
  {
    id: 'FS-014',
    name: 'Razor 014',
    category: 'Kelso Cock',
    detail: 'Proven breeder',
    price: 'PHP 28,000',
    status: 'Available',
    image: ROOSTER_IMAGE,
  },
  {
    id: 'FS-052',
    name: 'Ruby 052',
    category: 'Roundhead Hen',
    detail: 'Healthy layer',
    price: 'PHP 12,000',
    status: 'Available',
    image: HEN_IMAGE,
  },
  {
    id: 'FS-008',
    name: 'Blade 008',
    category: 'Roundhead Cock',
    detail: 'Conditioned stag',
    price: 'PHP 18,500',
    status: 'Reserved',
    image: BLACK_ROOSTER_IMAGE,
  },
];

const RESERVABLE_STOCK = [
  {
    id: 'RS-B001',
    name: 'Batch B-001 Chicks',
    category: 'Incubating eggs',
    stage: 'Day 8 incubation',
    availability: 'Expected hatch Sep 12',
    available: '6 slots',
    deposit: 'PHP 2,000 deposit',
    status: 'Open reserve',
    image: INCUBATING_EGGS_IMAGE,
  },
  {
    id: 'RS-B002',
    name: 'Batch B-002 Chicks',
    category: 'Near hatch',
    stage: 'Hatching soon',
    availability: 'Ready in 3 days',
    available: '3 slots',
    deposit: 'PHP 2,500 deposit',
    status: 'Priority reserve',
    image: HATCHED_CHICKS_IMAGE,
  },
  {
    id: 'RS-RR',
    name: 'Razor x Ruby Eggs',
    category: 'Fertile egg reservation',
    stage: 'Holding group',
    availability: 'Ready to set',
    available: '5 eggs',
    deposit: 'PHP 500 per egg',
    status: 'Available',
    image: INCUBATING_EGGS_IMAGE,
  },
];

const SAMPLE_RESERVED_ORDERS = [
  {
    id: 'RSV-001',
    releaseType: 'reservation',
    buyerName: 'Miguel Dela Cruz',
    readyWindow: 'Sep 15, 2026',
    price: '2,000',
    bird: {
      name: 'Blade 008',
      image: BLACK_ROOSTER_IMAGE,
    },
  },
];

function getBirdKey(bird) {
  return bird?._recordKey || bird?.farmBuzzId || bird?.name;
}

function getBirdCategory(bird) {
  const bloodline = bird?.bloodline?.replace(' Bloodline', '') || 'Gamefowl';
  return `${bloodline} ${bird?.type || 'Bird'}`;
}

function parsePrice(price) {
  return Number(String(price || '').replace(/[^\d]/g, '')) || 0;
}

function formatCurrency(value) {
  return value ? `PHP ${value.toLocaleString()}` : 'No sale';
}

function formatShortCurrency(value) {
  if (!value) return 'No deposits';
  if (value >= 1000) {
    const amount = value / 1000;
    const rounded = Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
    return `PHP ${rounded}K deposits`;
  }
  return `PHP ${value.toLocaleString()} deposits`;
}

function formatShortSales(value) {
  if (!value) return 'No sales';
  if (value >= 1000) {
    const amount = value / 1000;
    const rounded = Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
    return `PHP ${rounded}K sales`;
  }
  return `PHP ${value.toLocaleString()} sales`;
}

function withoutDepositLabel(value) {
  return String(value || '').replace(/\s+deposit$/i, '');
}

function makeTransactionId(entry, index) {
  if (entry.id?.startsWith('ownership-')) return `SL-${entry.id.replace(/\D/g, '').slice(-6)}`;
  return entry.id || `SL-${String(index + 1).padStart(4, '0')}`;
}

function HeaderButton({ icon, label, onPress }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={21} color="#eef1f2" />
    </Pressable>
  );
}

function SummaryCard({ item, narrow }) {
  return (
    <View style={[styles.summaryCard, narrow && styles.summaryCardNarrow]}>
      <View style={styles.summaryValueRow}>
        <MaterialCommunityIcons name={item.icon} size={narrow ? 25 : 29} color={item.color} />
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.summaryValue, narrow && styles.summaryValueNarrow]}>
          {narrow ? item.mobileValue : item.value}
        </Text>
      </View>
      <Text style={styles.summaryLabel}>{item.label}</Text>
      <Text style={[styles.summaryDetail, item.detail.startsWith('+') && styles.positive]}>{item.detail}</Text>
    </View>
  );
}

function FilterButton({ item, active, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.filterButton, active && styles.filterButtonActive, pressed && styles.pressed]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
    </Pressable>
  );
}

function TransactionRow({ transaction, isLast, narrow }) {
  const confirmed = transaction.status === 'Confirmed';
  const statusColor = confirmed ? '#69dd64' : '#ff9a00';
  return (
    <Pressable
      accessibilityLabel={`Open sale ${transaction.id}`}
      onPress={() => Alert.alert(transaction.item, `${transaction.type} to ${transaction.owner}\n${transaction.price}\n${transaction.status}`)}
      style={({ pressed }) => [styles.transactionRow, narrow && styles.transactionRowNarrow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Image source={transaction.image} style={[styles.itemImage, narrow && styles.itemImageNarrow]} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.transactionMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={1} style={styles.itemName}>{transaction.item}</Text>
          <Text style={styles.saleId}>{transaction.id}</Text>
        </View>
        <Text numberOfLines={1} style={styles.buyerName}>
          <Text style={styles.transferType}>{transaction.type} to </Text>{transaction.owner}
        </Text>
        <View style={styles.saleMeta}>
          <MaterialCommunityIcons name="tag-outline" size={12} color="#7e8a8e" />
          <Text numberOfLines={1} style={styles.categoryText}>{transaction.category}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text numberOfLines={1} style={styles.dateText}>{transaction.date}</Text>
        </View>
      </View>
      <View style={[styles.transactionAside, narrow && styles.transactionAsideNarrow]}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.priceText}>{transaction.price}</Text>
        <View style={[styles.statusChip, { borderColor: `${statusColor}2b`, backgroundColor: `${statusColor}0d` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{transaction.status}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#9da6a9" />
    </Pressable>
  );
}

function SaleBirdRow({ item, isLast, narrow }) {
  const reserved = item.status === 'Reserved';
  const statusColor = reserved ? '#ffb000' : '#69dd64';
  return (
    <Pressable
      accessibilityLabel={`Open sale bird ${item.name}`}
      onPress={() => Alert.alert('For sale', `${item.name}\n${item.category}\n${item.price}`)}
      style={({ pressed }) => [styles.transactionRow, narrow && styles.transactionRowNarrow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Image source={item.image} style={[styles.itemImage, narrow && styles.itemImageNarrow]} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.transactionMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
          <Text style={styles.saleId}>{item.id}</Text>
        </View>
        <Text numberOfLines={1} style={styles.buyerName}>
          <Text style={styles.transferType}>{item.category}</Text>
        </Text>
        <View style={styles.saleMeta}>
          <MaterialCommunityIcons name="bird" size={12} color="#7e8a8e" />
          <Text numberOfLines={1} style={styles.dateText}>{item.detail}</Text>
        </View>
      </View>
      <View style={[styles.transactionAside, narrow && styles.transactionAsideNarrow]}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.priceText}>{item.price}</Text>
        <View style={[styles.statusChip, { borderColor: `${statusColor}2b`, backgroundColor: `${statusColor}0d` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ReservationRow({ order, isLast, narrow }) {
  return (
    <Pressable
      accessibilityLabel={`Open reservation ${order.id}`}
      onPress={() => Alert.alert(order.bird.name, `Reserved for ${order.buyerName}\nPickup before ${order.readyWindow}\nPHP ${order.price}`)}
      style={({ pressed }) => [styles.reservationRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Image source={order.bird.image} style={[styles.reservationImage, narrow && styles.reservationImageNarrow]} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.transactionMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={1} style={styles.itemName}>{order.bird.name}</Text>
          <Text style={styles.saleId}>RESERVED</Text>
        </View>
        <Text numberOfLines={1} style={styles.buyerName}>
          <Text style={styles.transferType}>Buyer </Text>{order.buyerName}
        </Text>
        <View style={styles.saleMeta}>
          <MaterialCommunityIcons name="calendar-clock-outline" size={12} color="#7e8a8e" />
          <Text numberOfLines={1} style={styles.dateText}>Pickup before {order.readyWindow}</Text>
        </View>
      </View>
      <View style={[styles.transactionAside, narrow && styles.transactionAsideNarrow]}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.priceText}>PHP {order.price}</Text>
        <View style={[styles.statusChip, { borderColor: '#ffb0002b', backgroundColor: '#ffb0000d' }]}>
          <Text style={[styles.statusText, { color: '#ffb000' }]}>Reserved</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ReserveStockRow({ item, isLast, narrow }) {
  return (
    <Pressable
      accessibilityLabel={`Reserve ${item.name}`}
      onPress={() => Alert.alert('Reserve stock', `${item.name}\n${item.availability}\n${item.deposit}`)}
      style={({ pressed }) => [styles.reservationRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Image source={item.image} style={[styles.reservationImage, narrow && styles.reservationImageNarrow]} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.transactionMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
          <Text style={styles.saleId}>{item.id}</Text>
        </View>
        <Text numberOfLines={1} style={styles.buyerName}>
          <Text style={styles.transferType}>{item.category}</Text>
        </Text>
        <View style={styles.saleMeta}>
          <MaterialCommunityIcons name="calendar-clock-outline" size={12} color="#7e8a8e" />
          <Text numberOfLines={1} style={styles.dateText}>{item.stage} - {item.availability}</Text>
        </View>
      </View>
      <View style={[styles.transactionAside, narrow && styles.transactionAsideNarrow]}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.priceText}>{item.deposit}</Text>
        <View style={[styles.statusChip, { borderColor: '#ffb0002b', backgroundColor: '#ffb0000d' }]}>
          <Text style={[styles.statusText, { color: '#ffb000' }]}>{item.available}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ListingRow({ listing, isLast, narrow }) {
  const item = listing.item;
  const isSale = listing.kind === 'sale';
  const isReserve = listing.kind === 'reserve';
  const isOrder = !!listing.order;
  const isSold = listing.kind === 'sold';
  const statusColor = isSold
    ? item.status === 'Confirmed' ? '#69dd64' : '#ff9a00'
    : isReserve || isOrder
      ? '#ffb000'
      : item.status === 'Reserved'
        ? '#ffb000'
        : '#69dd64';
  const image = isOrder ? item.bird.image : isSold ? item.image : item.image;
  const title = isOrder ? item.bird.name : isSold ? item.item : item.name;
  const eyebrow = isOrder
    ? `Buyer ${item.buyerName}`
    : isSold
      ? `${item.type} to ${item.owner}`
      : item.category;
  const detail = isOrder
    ? `Pickup before ${item.readyWindow}`
    : isSold
      ? `${item.category} - ${item.date}`
      : isReserve
        ? `${item.stage} - ${item.availability}`
        : item.detail;
  const amount = isOrder
    ? `PHP ${item.price}`
    : isSold
      ? item.price
      : isReserve
        ? withoutDepositLabel(item.deposit)
        : item.price;
  const amountLabel = isReserve || isOrder ? 'Deposit' : isSold ? item.type : 'Price';
  const status = isOrder ? 'Reserved' : isReserve ? item.available : isSold ? item.status : item.status;
  const imageStyle = isReserve || isOrder ? styles.reservationImage : styles.itemImage;
  const thumbnailFit = isReserve || isOrder ? 'contain' : 'cover';

  return (
    <Pressable
      accessibilityLabel={`Open listing ${title}`}
      onPress={() => Alert.alert(title, `${eyebrow}\n${detail}\n${amount}`)}
      style={({ pressed }) => [styles.transactionRow, narrow && styles.transactionRowNarrow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Image source={image} style={[imageStyle, narrow && styles.itemImageNarrow]} contentFit={thumbnailFit} cachePolicy="memory-disk" />
      <View style={styles.transactionMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={1} style={styles.itemName}>{title}</Text>
          <Text style={styles.saleId}>{listing.key}</Text>
        </View>
        <Text numberOfLines={1} style={styles.buyerName}>{eyebrow}</Text>
        <Text numberOfLines={1} style={styles.listingDetail}>{detail}</Text>
      </View>
      <View style={[styles.transactionAside, narrow && styles.transactionAsideNarrow]}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.priceText}>{amount}</Text>
        <Text style={styles.priceLabel}>{amountLabel}</Text>
        <View style={[styles.statusChip, { borderColor: `${statusColor}2b`, backgroundColor: `${statusColor}0d` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function SalesScreen({ onBack, onOpenPurchase, birds = [], ownershipByBird = {}, purchaseOrders = [] }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const [listingFilter, setListingFilter] = useState('all');

  const recordedTransactions = useMemo(() => {
    return birds
      .flatMap((bird) => {
        const record = ownershipByBird[getBirdKey(bird)];
        return (record?.history || [])
          .filter((entry) => ['Sold', 'Transferred', 'Gifted'].includes(entry.type))
          .map((entry, index) => {
            const priceValue = parsePrice(entry.price);
            return {
              id: makeTransactionId(entry, index),
              item: bird.name,
              category: getBirdCategory(bird),
              owner: entry.to || record.owner || 'Not recorded',
              date: entry.date || record.since || 'Date not recorded',
              type: entry.type,
              price: entry.type === 'Sold' ? formatCurrency(priceValue) : 'No sale',
              priceValue,
              status: 'Confirmed',
              image: bird.image || (bird.type === 'Hen' || bird.type === 'Pullet' ? HEN_IMAGE : ROOSTER_IMAGE),
            };
          });
      })
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [birds, ownershipByBird]);

  const salesSummary = useMemo(() => {
    const sold = recordedTransactions.filter((transaction) => transaction.type === 'Sold');
    const reserved = purchaseOrders.length
      ? purchaseOrders.filter((order) => order.releaseType === 'reservation')
      : SAMPLE_RESERVED_ORDERS;
    const soldAmount = sold.reduce((total, transaction) => total + transaction.priceValue, 0);
    const reservedAmount = reserved.reduce((total, order) => total + parsePrice(order.price), 0);
    return [
      { icon: 'tag-outline', value: String(FOR_SALE_BIRDS.length), mobileValue: String(FOR_SALE_BIRDS.length), label: 'For Sale', detail: 'Ready birds', color: '#ff8500' },
      { icon: 'calendar-clock-outline', value: String(reserved.length), mobileValue: String(reserved.length), label: 'Reserved', detail: formatShortCurrency(reservedAmount), color: '#ffb000' },
      { icon: 'cash-check', value: String(sold.length), mobileValue: String(sold.length), label: 'Sold', detail: formatShortSales(soldAmount), color: '#75d94e' },
    ];
  }, [purchaseOrders, recordedTransactions]);

  const reservations = useMemo(() => (
    purchaseOrders.length
      ? purchaseOrders.filter((order) => order.releaseType === 'reservation')
      : SAMPLE_RESERVED_ORDERS
  ), [purchaseOrders]);

  const visibleListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const listings = [
      ...FOR_SALE_BIRDS.map((item) => ({ kind: 'sale', key: item.id, item })),
      ...RESERVABLE_STOCK.map((item) => ({ kind: 'reserve', key: item.id, item })),
      ...reservations.map((item) => ({ kind: 'reserve', key: item.id, item, order: true })),
      ...recordedTransactions.map((item) => ({ kind: 'sold', key: item.id, item })),
    ];

    return listings.filter((listing) => {
      const item = listing.item;
      const searchable = listing.order
        ? `${item.id} ${item.bird?.name} ${item.buyerName} ${item.readyWindow}`
        : listing.kind === 'sale'
          ? `${item.id} ${item.name} ${item.category} ${item.detail} ${item.status}`
          : listing.kind === 'reserve'
            ? `${item.id} ${item.name} ${item.category} ${item.stage} ${item.availability}`
            : `${item.id} ${item.item} ${item.category} ${item.owner} ${item.type}`;
      const matchesFilter = listingFilter === 'all' || listing.kind === listingFilter;
      return matchesFilter && searchable.toLowerCase().includes(normalized);
    }).slice(0, 6);
  }, [listingFilter, query, recordedTransactions, reservations]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={SALES_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.24)', 'rgba(2, 7, 9, 0.12)', '#040a0d']}
              locations={[0, 0.43, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to management" onPress={onBack} />
                  <Text style={styles.screenTitle}>Sales & Transfers</Text>
                </View>
                <HeaderButton icon="settings-outline" label="Ownership settings" onPress={() => Alert.alert('Ownership settings')} />
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Sell available birds and reserve eggs or chicks before release.</Text>
                <View style={styles.farmMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Pampanga, Philippines</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Est. 2020</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={[styles.actionRow, compact && styles.actionRowCompact]}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={22} color="#9aa4a8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search birds, buyers, eggs..."
                  placeholderTextColor="#879195"
                  selectionColor="#ff8500"
                  style={styles.searchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable accessibilityLabel="Add sale or reservation" onPress={onOpenPurchase} style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}>
                <Ionicons name="add" size={27} color="#fff" />
                {!compact && <Text style={styles.addButtonText}>New Sale</Text>}
              </Pressable>
            </View>

            <View style={styles.summaryGrid}>
              {salesSummary.map((item) => <SummaryCard key={item.label} item={item} narrow={narrow} />)}
            </View>

            <View style={styles.salesHeader}>
              <View>
                <Text style={styles.sectionTitle}>Listings</Text>
                <Text style={styles.sectionDetail}>Birds for sale, reservations, and sold records</Text>
              </View>
              <View style={styles.filters}>
                {LISTING_FILTERS.map((item) => (
                  <FilterButton
                    key={item.id}
                    item={item}
                    active={listingFilter === item.id}
                    onPress={() => setListingFilter(item.id)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.transactionList}>
              {visibleListings.map((listing, index) => {
                const isLast = index === visibleListings.length - 1;
                return <ListingRow key={listing.key} listing={listing} narrow={narrow} isLast={isLast} />;
              })}
              {!visibleListings.length && <Text style={styles.emptyText}>No listings found</Text>}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 270, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 260 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', maxWidth: 450, paddingHorizontal: 18, paddingBottom: 23 },
  heroCopyNarrow: { maxWidth: 330, paddingHorizontal: 12, paddingBottom: 17 },
  farmName: { color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  farmMeta: { marginTop: 13, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#b8c0c2', fontSize: 12, letterSpacing: 0 },
  metaDivider: { width: 1, height: 14, backgroundColor: '#6d777a' },
  content: { paddingHorizontal: 10, paddingBottom: 22 },
  contentNarrow: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionRowCompact: { flexDirection: 'row', gap: 8 },
  searchBox: { flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#28343a', backgroundColor: '#0b1418' },
  searchInput: { flex: 1, height: 50, paddingVertical: 0, color: '#e7ebec', fontSize: 14, letterSpacing: 0, outlineStyle: 'none' },
  addButton: { height: 52, minWidth: 140, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  summaryGrid: { marginTop: 14, flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, minWidth: 0, height: 112, paddingHorizontal: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryCardNarrow: { height: 104, paddingHorizontal: 5 },
  summaryIcon: { width: 37, height: 37, borderRadius: 19, backgroundColor: 'rgba(255, 133, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryValue: { color: '#f0f2f3', fontSize: 27, lineHeight: 30, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
  summaryValueNarrow: { fontSize: 23, lineHeight: 26 },
  summaryLabel: { marginTop: 8, color: '#d4d9db', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  summaryDetail: { marginTop: 4, color: '#899397', fontSize: 10, textAlign: 'center', letterSpacing: 0 },
  positive: { color: '#68d85c' },
  sectionTitle: { color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  sectionDetail: { marginTop: 3, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  salesHeader: { marginTop: 21, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  filters: { flexDirection: 'row', gap: 5 },
  filterButton: { minHeight: 31, paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: '#202b30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center' },
  filterButtonActive: { borderColor: '#ff8500', backgroundColor: 'rgba(255, 133, 0, 0.1)' },
  filterText: { color: '#899397', fontSize: 9, letterSpacing: 0 },
  filterTextActive: { color: '#ff9a00' },
  transactionList: { borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', overflow: 'hidden' },
  transactionRow: { minHeight: 86, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  reservationRow: { minHeight: 82, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 11 },
  transactionRowNarrow: { minHeight: 88, paddingHorizontal: 8, gap: 7 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b292f' },
  itemImage: { width: 52, height: 52, borderRadius: 7, borderWidth: 1, borderColor: '#2d3a3f' },
  reservationImage: { width: 52, height: 52, borderRadius: 7, borderWidth: 1, borderColor: '#70450d', backgroundColor: '#061014' },
  reservationImageNarrow: { width: 46, height: 46 },
  itemImageNarrow: { width: 46, height: 46 },
  transactionMain: { flex: 1, minWidth: 0 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  itemName: { flexShrink: 1, color: '#e8eced', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  saleId: { color: '#687579', fontSize: 8, letterSpacing: 0 },
  buyerName: { marginTop: 3, color: '#d3d8da', fontSize: 10, letterSpacing: 0 },
  transferType: { color: '#ff9200', fontWeight: '600' },
  listingDetail: { marginTop: 6, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  saleMeta: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  categoryText: { maxWidth: '44%', color: '#7e8a8e', fontSize: 8, letterSpacing: 0 },
  dateText: { flex: 1, color: '#7e8a8e', fontSize: 8, letterSpacing: 0 },
  metaDot: { color: '#5f6b6f', fontSize: 8 },
  transactionAside: { width: 108, alignItems: 'flex-end', gap: 5 },
  transactionAsideNarrow: { width: 88 },
  priceText: { width: '100%', color: '#f0f2f3', fontSize: 11, fontWeight: '700', textAlign: 'right', letterSpacing: 0 },
  priceLabel: { color: '#6f7b7f', fontSize: 8, textAlign: 'right', letterSpacing: 0 },
  statusChip: { minHeight: 23, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, justifyContent: 'center' },
  statusText: { fontSize: 8, fontWeight: '600', letterSpacing: 0 },
  emptyText: { paddingVertical: 30, color: '#7f8a8e', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  rowPressed: { backgroundColor: '#101c21' },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});
