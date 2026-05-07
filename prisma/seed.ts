import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data (in reverse dependency order)
  console.log('🧹 Cleaning existing data...')
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.inquiry.deleteMany()
  await db.visitorStat.deleteMany()
  await db.subscription.deleteMany()
  await db.deal.deleteMany()
  await db.banner.deleteMany()
  await db.shopTag.deleteMany()
  await db.product.deleteMany()
  await db.productCategory.deleteMany()
  await db.shop.deleteMany()
  await db.shopCategory.deleteMany()
  await db.mall.deleteMany()
  await db.user.deleteMany()

  // ============ USERS ============
  console.log('👤 Creating users...')

  const admin = await db.user.create({
    data: {
      email: 'admin@mall.com',
      name: 'Mall Admin',
      password: 'admin123',
      role: 'admin',
      phone: '+966500000001',
    },
  })

  const merchant1 = await db.user.create({
    data: {
      email: 'merchant1@mall.com',
      name: 'Zara Manager',
      password: 'merchant123',
      role: 'merchant',
      phone: '+966500000002',
    },
  })

  const merchant2 = await db.user.create({
    data: {
      email: 'merchant2@mall.com',
      name: 'Fresh Market Manager',
      password: 'merchant123',
      role: 'merchant',
      phone: '+966500000003',
    },
  })

  const customer = await db.user.create({
    data: {
      email: 'customer@mall.com',
      name: 'Ahmed Customer',
      password: 'customer123',
      role: 'customer',
      phone: '+966500000004',
    },
  })

  // ============ MALL ============
  console.log('🏬 Creating mall...')

  const mall = await db.mall.create({
    data: {
      name: 'Grand Mall',
      nameAr: 'جراند مول',
      description: 'The premier shopping destination in the city, featuring world-class brands, dining, and entertainment.',
      descriptionAr: 'وجهة التسوق الأولى في المدينة، تضم علامات تجارية عالمية ومطاعم وترفيه.',
      address: 'King Fahd Road, Riyadh, Saudi Arabia',
      addressAr: 'طريق الملك فهد، الرياض، المملكة العربية السعودية',
      phone: '+966112000000',
      email: 'info@grandmall.sa',
      floors: 3,
      openTime: '09:00',
      closeTime: '22:00',
    },
  })

  // ============ SHOP CATEGORIES ============
  console.log('📂 Creating shop categories...')

  const fashionCat = await db.shopCategory.create({
    data: {
      name: 'Fashion',
      nameAr: 'أزياء',
      icon: 'Shirt',
      color: '#E11D48',
    },
  })

  const electronicsCat = await db.shopCategory.create({
    data: {
      name: 'Electronics',
      nameAr: 'إلكترونيات',
      icon: 'Smartphone',
      color: '#2563EB',
    },
  })

  const restaurantsCat = await db.shopCategory.create({
    data: {
      name: 'Restaurants',
      nameAr: 'مطاعم',
      icon: 'UtensilsCrossed',
      color: '#EA580C',
    },
  })

  const entertainmentCat = await db.shopCategory.create({
    data: {
      name: 'Entertainment',
      nameAr: 'ترفيه',
      icon: 'Clapperboard',
      color: '#9333EA',
    },
  })

  const supermarketCat = await db.shopCategory.create({
    data: {
      name: 'Supermarket',
      nameAr: 'سوبرماركت',
      icon: 'ShoppingCart',
      color: '#16A34A',
    },
  })

  const beautyCat = await db.shopCategory.create({
    data: {
      name: 'Beauty',
      nameAr: 'تجميل',
      icon: 'Sparkles',
      color: '#DB2777',
    },
  })

  const sportsCat = await db.shopCategory.create({
    data: {
      name: 'Sports',
      nameAr: 'رياضة',
      icon: 'Dumbbell',
      color: '#CA8A04',
    },
  })

  const homeCat = await db.shopCategory.create({
    data: {
      name: 'Home',
      nameAr: 'منزل',
      icon: 'Home',
      color: '#0891B2',
    },
  })

  // ============ SHOPS ============
  console.log('🏪 Creating shops...')

  const zaraShop = await db.shop.create({
    data: {
      name: 'Zara Fashion',
      nameAr: 'زارا للأزياء',
      description: 'Leading fashion brand offering the latest trends in clothing, accessories, and footwear for men, women, and children.',
      descriptionAr: 'علامة أزياء رائدة تقدم أحدث صيحات الموضة في الملابس والإكسسوارات والأحذية للرجال والنساء والأطفال.',
      categoryId: fashionCat.id,
      mallId: mall.id,
      ownerId: merchant1.id,
      floor: 1,
      shopNumber: 'A01',
      phone: '+966112000101',
      email: 'zara@grandmall.sa',
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
      subscriptionTier: 'premium',
    },
  })

  const samsungShop = await db.shop.create({
    data: {
      name: 'Samsung Store',
      nameAr: 'متجر سامسونج',
      description: 'Official Samsung store featuring the latest smartphones, tablets, TVs, and home appliances.',
      descriptionAr: 'متجر سامسونج الرسمي يضم أحدث الهواتف الذكية والأجهزة اللوحية والتلفزيونات والأجهزة المنزلية.',
      categoryId: electronicsCat.id,
      mallId: mall.id,
      floor: 2,
      shopNumber: 'B01',
      phone: '+966112000201',
      email: 'samsung@grandmall.sa',
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
      subscriptionTier: 'free',
    },
  })

  const freshMarketShop = await db.shop.create({
    data: {
      name: 'Fresh Market',
      nameAr: 'فريش ماركت',
      description: 'Your neighborhood supermarket with fresh produce, dairy, bakery, and household essentials. Order online and collect in-store!',
      descriptionAr: 'سوبرماركتك القريب مع منتجات طازجة وألبان ومخبوزات ومستلزمات منزلية. اطلب أونلاين واستلم من المتجر!',
      categoryId: supermarketCat.id,
      mallId: mall.id,
      ownerId: merchant2.id,
      floor: 1,
      shopNumber: 'A15',
      phone: '+966112000115',
      email: 'freshmarket@grandmall.sa',
      isOpen: true,
      openTime: '08:00',
      closeTime: '23:00',
      subscriptionTier: 'premium',
    },
  })

  const mcdonaldsShop = await db.shop.create({
    data: {
      name: "McDonald's",
      nameAr: 'ماكدونالدز',
      description: 'The world-famous fast food restaurant serving burgers, fries, chicken nuggets, and happy meals.',
      descriptionAr: 'مطعم الوجبات السريعة الشهير عالمياً يقدم البرجر والبطاطس والدجاج ووجبات الأطفال.',
      categoryId: restaurantsCat.id,
      mallId: mall.id,
      floor: 3,
      shopNumber: 'FC01',
      phone: '+966112000301',
      email: 'mcdonalds@grandmall.sa',
      isOpen: true,
      openTime: '10:00',
      closeTime: '23:00',
      subscriptionTier: 'free',
    },
  })

  const voxShop = await db.shop.create({
    data: {
      name: 'VOX Cinema',
      nameAr: 'سينما فوكس',
      description: 'Premium cinema experience with the latest movies, IMAX, and 4DX screenings. Book your tickets now!',
      descriptionAr: 'تجربة سينمائية متميزة مع أحدث الأفلام وعروض IMAX و 4DX. احجز تذاكرك الآن!',
      categoryId: entertainmentCat.id,
      mallId: mall.id,
      floor: 3,
      shopNumber: 'C01',
      phone: '+966112000302',
      email: 'vox@grandmall.sa',
      isOpen: true,
      openTime: '10:00',
      closeTime: '01:00',
      subscriptionTier: 'premium',
    },
  })

  const sephoraShop = await db.shop.create({
    data: {
      name: 'Sephora',
      nameAr: 'سيفورا',
      description: 'Beauty retailer offering makeup, skincare, fragrance, and haircare from top brands worldwide.',
      descriptionAr: 'متجر التجميل يقدم مكياج وعناية بالبشرة وعطور وعناية بالشعر من أفضل العلامات التجارية.',
      categoryId: beautyCat.id,
      mallId: mall.id,
      floor: 1,
      shopNumber: 'A08',
      phone: '+966112000108',
      email: 'sephora@grandmall.sa',
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
      subscriptionTier: 'premium',
    },
  })

  const nikeShop = await db.shop.create({
    data: {
      name: 'Nike',
      nameAr: 'نايكي',
      description: 'Just Do It. Premium sportswear, running shoes, athletic apparel, and accessories for every athlete.',
      descriptionAr: 'فقط افعلها. ملابس رياضية وأحذية جري وملابس رياضية وإكسسوارات لكل رياضي.',
      categoryId: sportsCat.id,
      mallId: mall.id,
      floor: 2,
      shopNumber: 'B05',
      phone: '+966112000205',
      email: 'nike@grandmall.sa',
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
      subscriptionTier: 'free',
    },
  })

  const ikeaShop = await db.shop.create({
    data: {
      name: 'IKEA',
      nameAr: 'ايكيا',
      description: 'Swedish-founded furniture and home accessories retailer known for modern design and affordable prices.',
      descriptionAr: 'متجر أثاث وإكسسوارات منزلية سويدي الأصل معروف بالتصميم العصري والأسعار المعقولة.',
      categoryId: homeCat.id,
      mallId: mall.id,
      floor: 2,
      shopNumber: 'B10',
      phone: '+966112000210',
      email: 'ikea@grandmall.sa',
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
      subscriptionTier: 'free',
    },
  })

  const hmShop = await db.shop.create({
    data: {
      name: 'H&M',
      nameAr: 'إتش آند إم',
      description: 'Fashion and quality at the best price in a sustainable way. Clothing for all ages and styles.',
      descriptionAr: 'الموضة والجودة بأفضل سعر بطريقة مستدامة. ملابس لجميع الأعمار والأنماط.',
      categoryId: fashionCat.id,
      mallId: mall.id,
      floor: 1,
      shopNumber: 'A03',
      phone: '+966112000103',
      email: 'hm@grandmall.sa',
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
      subscriptionTier: 'free',
    },
  })

  const appleShop = await db.shop.create({
    data: {
      name: 'Apple Store',
      nameAr: 'متجر آبل',
      description: 'Official Apple store featuring iPhone, iPad, Mac, Apple Watch, AirPods, and all Apple accessories.',
      descriptionAr: 'متجر آبل الرسمي يضم آيفون وآيباد وماك وآبل ووتش وإيربودز وجميع إكسسوارات آبل.',
      categoryId: electronicsCat.id,
      mallId: mall.id,
      floor: 2,
      shopNumber: 'B03',
      phone: '+966112000203',
      email: 'apple@grandmall.sa',
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
      subscriptionTier: 'premium',
    },
  })

  const pizzaHutShop = await db.shop.create({
    data: {
      name: 'Pizza Hut',
      nameAr: 'بيتزا هت',
      description: 'Delicious pizzas, pasta, wings, and sides. Dine-in, takeaway, or delivery available.',
      descriptionAr: 'بيتزا لذيذة وباستا وأجنحة وأطباق جانبية. تناول في المطعم أو سفري أو توصيل.',
      categoryId: restaurantsCat.id,
      mallId: mall.id,
      floor: 3,
      shopNumber: 'FC02',
      phone: '+966112000302',
      email: 'pizzahut@grandmall.sa',
      isOpen: true,
      openTime: '10:00',
      closeTime: '23:00',
      subscriptionTier: 'free',
    },
  })

  const carrefourShop = await db.shop.create({
    data: {
      name: 'Carrefour',
      nameAr: 'كارفور',
      description: 'International hypermarket offering groceries, electronics, clothing, and household goods at great prices.',
      descriptionAr: 'هايبرماركت دولي يقدم بقالة وإلكترونيات وملابس ومستلزمات منزلية بأسعار رائعة.',
      categoryId: supermarketCat.id,
      mallId: mall.id,
      floor: 1,
      shopNumber: 'A20',
      phone: '+966112000120',
      email: 'carrefour@grandmall.sa',
      isOpen: true,
      openTime: '08:00',
      closeTime: '23:00',
      subscriptionTier: 'premium',
    },
  })

  // ============ SHOP TAGS ============
  console.log('🏷️ Creating shop tags...')

  // Zara tags
  await db.shopTag.createMany({
    data: [
      { shopId: zaraShop.id, tag: 'قميص' },
      { shopId: zaraShop.id, tag: 'قطني' },
      { shopId: zaraShop.id, tag: 'أحذية' },
      { shopId: zaraShop.id, tag: 'أزياء نسائية' },
      { shopId: zaraShop.id, tag: 'أزياء رجالية' },
    ],
  })

  // Samsung tags
  await db.shopTag.createMany({
    data: [
      { shopId: samsungShop.id, tag: 'هاتف ذكي' },
      { shopId: samsungShop.id, tag: 'تلفزيون' },
      { shopId: samsungShop.id, tag: 'أجهزة منزلية' },
      { shopId: samsungShop.id, tag: 'ساعات ذكية' },
    ],
  })

  // Fresh Market tags
  await db.shopTag.createMany({
    data: [
      { shopId: freshMarketShop.id, tag: 'فواكه طازجة' },
      { shopId: freshMarketShop.id, tag: 'خضروات' },
      { shopId: freshMarketShop.id, tag: 'ألبان' },
      { shopId: freshMarketShop.id, tag: 'مخبوزات' },
      { shopId: freshMarketShop.id, tag: 'طلب أونلاين' },
    ],
  })

  // McDonald's tags
  await db.shopTag.createMany({
    data: [
      { shopId: mcdonaldsShop.id, tag: 'برجر' },
      { shopId: mcdonaldsShop.id, tag: 'وجبات سريعة' },
      { shopId: mcdonaldsShop.id, tag: 'وجبات أطفال' },
      { shopId: mcdonaldsShop.id, tag: 'قهوة' },
    ],
  })

  // VOX Cinema tags
  await db.shopTag.createMany({
    data: [
      { shopId: voxShop.id, tag: 'أفلام' },
      { shopId: voxShop.id, tag: 'IMAX' },
      { shopId: voxShop.id, tag: '4DX' },
      { shopId: voxShop.id, tag: 'بوب كورن' },
    ],
  })

  // Sephora tags
  await db.shopTag.createMany({
    data: [
      { shopId: sephoraShop.id, tag: 'مكياج' },
      { shopId: sephoraShop.id, tag: 'عناية بالبشرة' },
      { shopId: sephoraShop.id, tag: 'عطور' },
      { shopId: sephoraShop.id, tag: 'شعر' },
      { shopId: sephoraShop.id, tag: 'هدايا' },
    ],
  })

  // Nike tags
  await db.shopTag.createMany({
    data: [
      { shopId: nikeShop.id, tag: 'أحذية رياضية' },
      { shopId: nikeShop.id, tag: 'ملابس رياضية' },
      { shopId: nikeShop.id, tag: 'جري' },
      { shopId: nikeShop.id, tag: 'كرة قدم' },
    ],
  })

  // IKEA tags
  await db.shopTag.createMany({
    data: [
      { shopId: ikeaShop.id, tag: 'أثاث' },
      { shopId: ikeaShop.id, tag: 'ديكور' },
      { shopId: ikeaShop.id, tag: 'مطبخ' },
      { shopId: ikeaShop.id, tag: 'غرفة نوم' },
      { shopId: ikeaShop.id, tag: 'تخزين' },
    ],
  })

  // H&M tags
  await db.shopTag.createMany({
    data: [
      { shopId: hmShop.id, tag: 'أزياء' },
      { shopId: hmShop.id, tag: 'أطفال' },
      { shopId: hmShop.id, tag: 'موضة' },
      { shopId: hmShop.id, tag: 'ملابس صيفية' },
    ],
  })

  // Apple Store tags
  await db.shopTag.createMany({
    data: [
      { shopId: appleShop.id, tag: 'آيفون' },
      { shopId: appleShop.id, tag: 'ماك بوك' },
      { shopId: appleShop.id, tag: 'آيباد' },
      { shopId: appleShop.id, tag: 'إيربودز' },
      { shopId: appleShop.id, tag: 'آبل ووتش' },
    ],
  })

  // Pizza Hut tags
  await db.shopTag.createMany({
    data: [
      { shopId: pizzaHutShop.id, tag: 'بيتزا' },
      { shopId: pizzaHutShop.id, tag: 'باستا' },
      { shopId: pizzaHutShop.id, tag: 'أجنحة دجاج' },
      { shopId: pizzaHutShop.id, tag: 'مشروبات' },
    ],
  })

  // Carrefour tags
  await db.shopTag.createMany({
    data: [
      { shopId: carrefourShop.id, tag: 'بقالة' },
      { shopId: carrefourShop.id, tag: 'إلكترونيات' },
      { shopId: carrefourShop.id, tag: 'ملابس' },
      { shopId: carrefourShop.id, tag: 'عروض' },
    ],
  })

  // ============ PRODUCT CATEGORIES ============
  console.log('📦 Creating product categories...')

  const fruitsCat = await db.productCategory.create({
    data: { name: 'Fruits', nameAr: 'فواكه', icon: 'Apple' },
  })

  const vegetablesCat = await db.productCategory.create({
    data: { name: 'Vegetables', nameAr: 'خضروات', icon: 'Carrot' },
  })

  const dairyCat = await db.productCategory.create({
    data: { name: 'Dairy', nameAr: 'ألبان', icon: 'Milk' },
  })

  const bakeryCat = await db.productCategory.create({
    data: { name: 'Bakery', nameAr: 'مخبوزات', icon: 'Croissant' },
  })

  const beveragesCat = await db.productCategory.create({
    data: { name: 'Beverages', nameAr: 'مشروبات', icon: 'CupSoda' },
  })

  const meatCat = await db.productCategory.create({
    data: { name: 'Meat', nameAr: 'لحوم', icon: 'Beef' },
  })

  const snacksCat = await db.productCategory.create({
    data: { name: 'Snacks', nameAr: 'وجبات خفيفة', icon: 'Cookie' },
  })

  const householdCat = await db.productCategory.create({
    data: { name: 'Household', nameAr: 'مستلزمات منزلية', icon: 'SprayCan' },
  })

  // ============ PRODUCTS (Fresh Market) ============
  console.log('🛒 Creating products...')

  // Fruits
  await db.product.createMany({
    data: [
      {
        name: 'Red Apples',
        nameAr: 'تفاح أحمر',
        price: 8.50,
        categoryId: fruitsCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Bananas',
        nameAr: 'موز',
        price: 5.00,
        categoryId: fruitsCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Oranges',
        nameAr: 'برتقال',
        price: 6.00,
        categoryId: fruitsCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Strawberries',
        nameAr: 'فراولة',
        price: 15.00,
        categoryId: fruitsCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
      {
        name: 'Grapes',
        nameAr: 'عنب',
        price: 12.00,
        categoryId: fruitsCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
    ],
  })

  // Vegetables
  await db.product.createMany({
    data: [
      {
        name: 'Tomatoes',
        nameAr: 'طماطم',
        price: 4.50,
        categoryId: vegetablesCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Cucumbers',
        nameAr: 'خيار',
        price: 3.50,
        categoryId: vegetablesCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Carrots',
        nameAr: 'جزر',
        price: 3.00,
        categoryId: vegetablesCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Potatoes',
        nameAr: 'بطاطس',
        price: 4.00,
        categoryId: vegetablesCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Onions',
        nameAr: 'بصل',
        price: 3.50,
        categoryId: vegetablesCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
    ],
  })

  // Dairy
  await db.product.createMany({
    data: [
      {
        name: 'Full Cream Milk',
        nameAr: 'حليب كامل الدسم',
        price: 6.50,
        categoryId: dairyCat.id,
        shopId: freshMarketShop.id,
        unit: 'liter',
        inStock: true,
      },
      {
        name: 'Cheddar Cheese',
        nameAr: 'جبنة شيدر',
        price: 18.00,
        categoryId: dairyCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
      {
        name: 'Natural Yogurt',
        nameAr: 'زبادي طبيعي',
        price: 4.50,
        categoryId: dairyCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
      {
        name: 'Butter',
        nameAr: 'زبدة',
        price: 12.00,
        categoryId: dairyCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
    ],
  })

  // Bakery
  await db.product.createMany({
    data: [
      {
        name: 'White Bread',
        nameAr: 'خبز أبيض',
        price: 3.50,
        categoryId: bakeryCat.id,
        shopId: freshMarketShop.id,
        unit: 'piece',
        inStock: true,
      },
      {
        name: 'Croissants',
        nameAr: 'كرواسون',
        price: 8.00,
        categoryId: bakeryCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
      {
        name: 'Chocolate Cake',
        nameAr: 'كيكة شوكولاتة',
        price: 35.00,
        categoryId: bakeryCat.id,
        shopId: freshMarketShop.id,
        unit: 'piece',
        inStock: true,
      },
    ],
  })

  // Beverages
  await db.product.createMany({
    data: [
      {
        name: 'Mineral Water',
        nameAr: 'مياه معدنية',
        price: 2.00,
        categoryId: beveragesCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
      {
        name: 'Orange Juice',
        nameAr: 'عصير برتقال',
        price: 8.50,
        categoryId: beveragesCat.id,
        shopId: freshMarketShop.id,
        unit: 'liter',
        inStock: true,
      },
      {
        name: 'Cola',
        nameAr: 'كولا',
        price: 3.00,
        categoryId: beveragesCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
    ],
  })

  // Meat
  await db.product.createMany({
    data: [
      {
        name: 'Chicken Breast',
        nameAr: 'صدور دجاج',
        price: 28.00,
        categoryId: meatCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Beef Meat',
        nameAr: 'لحم بقري',
        price: 55.00,
        categoryId: meatCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Lamb Meat',
        nameAr: 'لحم غنم',
        price: 75.00,
        categoryId: meatCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
    ],
  })

  // Snacks
  await db.product.createMany({
    data: [
      {
        name: 'Potato Chips',
        nameAr: 'رقائق بطاطس',
        price: 7.50,
        categoryId: snacksCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
      {
        name: 'Chocolate Bar',
        nameAr: 'شوكولاتة',
        price: 5.50,
        categoryId: snacksCat.id,
        shopId: freshMarketShop.id,
        unit: 'piece',
        inStock: true,
      },
      {
        name: 'Cookies',
        nameAr: 'كوكيز',
        price: 9.00,
        categoryId: snacksCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
    ],
  })

  // Household
  await db.product.createMany({
    data: [
      {
        name: 'Hand Soap',
        nameAr: 'صابون يد',
        price: 6.00,
        categoryId: householdCat.id,
        shopId: freshMarketShop.id,
        unit: 'piece',
        inStock: true,
      },
      {
        name: 'Detergent',
        nameAr: 'منظف غسيل',
        price: 22.00,
        categoryId: householdCat.id,
        shopId: freshMarketShop.id,
        unit: 'pack',
        inStock: true,
      },
    ],
  })

  // Additional products to reach 30+
  await db.product.createMany({
    data: [
      {
        name: 'Basmati Rice',
        nameAr: 'أرز بسمتي',
        price: 18.00,
        categoryId: householdCat.id,
        shopId: freshMarketShop.id,
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Olive Oil',
        nameAr: 'زيت زيتون',
        price: 32.00,
        categoryId: householdCat.id,
        shopId: freshMarketShop.id,
        unit: 'liter',
        inStock: true,
      },
    ],
  })

  // ============ DEALS ============
  console.log('🏷️ Creating deals...')

  const now = new Date()
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  await db.deal.create({
    data: {
      shopId: zaraShop.id,
      title: '50% Off Summer Collection',
      titleAr: 'خصم 50% على مجموعة الصيف',
      description: 'Get half price on all summer clothing items including dresses, shorts, and t-shirts.',
      descriptionAr: 'احصل على نصف السعر على جميع ملابس الصيف بما في ذلك الفساتين والشورتات والقمصان.',
      discount: 50,
      originalPrice: 200,
      salePrice: 100,
      startDate: now,
      endDate: oneMonthFromNow,
      isApproved: true,
      isFeatured: true,
    },
  })

  await db.deal.create({
    data: {
      shopId: mcdonaldsShop.id,
      title: 'Buy 1 Get 1 Free',
      titleAr: 'اشتري واحصل على الثاني مجاناً',
      description: 'Buy any Big Mac meal and get a second one absolutely free!',
      descriptionAr: 'اشترِ أي وجبة بيج ماك واحصل على الثانية مجاناً!',
      discount: 50,
      originalPrice: 35,
      salePrice: 17.5,
      startDate: now,
      endDate: twoMonthsFromNow,
      isApproved: true,
      isFeatured: true,
    },
  })

  await db.deal.create({
    data: {
      shopId: samsungShop.id,
      title: 'Samsung Galaxy S24 20% Off',
      titleAr: 'سامسونج جالكسي S24 خصم 20%',
      description: 'Get 20% off on the latest Samsung Galaxy S24 series smartphones.',
      descriptionAr: 'احصل على خصم 20% على أحدث هواتف سامسونج جالكسي S24.',
      discount: 20,
      originalPrice: 3200,
      salePrice: 2560,
      startDate: now,
      endDate: oneMonthFromNow,
      isApproved: true,
      isFeatured: true,
    },
  })

  await db.deal.create({
    data: {
      shopId: freshMarketShop.id,
      title: 'Fresh Fruits 30% Off',
      titleAr: 'فواكه طازجة خصم 30%',
      description: '30% off on all fresh fruits this week. Eat healthy, save more!',
      descriptionAr: 'خصم 30% على جميع الفواكه الطازجة هذا الأسبوع. كل صحي، وفر أكثر!',
      discount: 30,
      startDate: now,
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      isApproved: true,
      isFeatured: false,
    },
  })

  await db.deal.create({
    data: {
      shopId: nikeShop.id,
      title: 'Nike Running Shoes 40% Off',
      titleAr: 'أحذية جري نايكي خصم 40%',
      description: '40% discount on all Nike running shoes. Limited time offer!',
      descriptionAr: 'خصم 40% على جميع أحذية الجري من نايكي. عرض لفترة محدودة!',
      discount: 40,
      originalPrice: 500,
      salePrice: 300,
      startDate: now,
      endDate: oneMonthFromNow,
      isApproved: true,
      isFeatured: true,
    },
  })

  await db.deal.create({
    data: {
      shopId: sephoraShop.id,
      title: 'Sephora Beauty Box 25% Off',
      titleAr: 'صندوق تجميل سيفورا خصم 25%',
      description: 'Get 25% off on the exclusive Sephora Beauty Box with premium skincare and makeup samples.',
      descriptionAr: 'احصل على خصم 25% على صندوق التجميل الحصري من سيفورا مع عينات العناية بالبشرة والمكياج.',
      discount: 25,
      originalPrice: 200,
      salePrice: 150,
      startDate: now,
      endDate: twoMonthsFromNow,
      isApproved: true,
      isFeatured: false,
    },
  })

  await db.deal.create({
    data: {
      shopId: voxShop.id,
      title: 'Movie Tickets 2 for 1',
      titleAr: 'تذاكر سينما اثنين بواحدة',
      description: 'Buy one movie ticket and get the second one free. Valid for all standard screenings.',
      descriptionAr: 'اشترِ تذكرة واحدة واحصل على الثانية مجاناً. صالح لجميع العروض العادية.',
      discount: 50,
      originalPrice: 70,
      salePrice: 35,
      startDate: now,
      endDate: oneMonthFromNow,
      isApproved: true,
      isFeatured: false,
    },
  })

  await db.deal.create({
    data: {
      shopId: appleShop.id,
      title: 'Apple AirPods 15% Off',
      titleAr: 'إيربودز آبل خصم 15%',
      description: '15% off on AirPods Pro 2nd generation. Premium sound at a special price.',
      descriptionAr: 'خصم 15% على إيربودز برو الجيل الثاني. صوت متميز بسعر خاص.',
      discount: 15,
      originalPrice: 950,
      salePrice: 807.5,
      startDate: now,
      endDate: oneMonthFromNow,
      isApproved: false, // Pending admin approval
      isFeatured: false,
    },
  })

  // One more pending deal for testing
  await db.deal.create({
    data: {
      shopId: carrefourShop.id,
      title: 'Weekend Mega Sale',
      titleAr: 'تخفيضات نهاية الأسبوع',
      description: 'Huge discounts across all departments this weekend only!',
      descriptionAr: 'تخفيضات ضخمة في جميع الأقسام هذا الأسبوع فقط!',
      discount: 35,
      startDate: now,
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      isApproved: false, // Pending admin approval
      isFeatured: false,
    },
  })

  // ============ BANNERS ============
  console.log('🖼️ Creating banners...')

  await db.banner.create({
    data: {
      mallId: mall.id,
      title: 'Grand Mall Summer Festival',
      titleAr: 'مهرجان جراند مول الصيفي',
      image: '/banners/summer-festival.jpg',
      link: 'deals',
      isActive: true,
      priority: 1,
      startDate: now,
      endDate: twoMonthsFromNow,
    },
  })

  await db.banner.create({
    data: {
      mallId: mall.id,
      title: 'New Stores Opening',
      titleAr: 'افتتاح متاجر جديدة',
      image: '/banners/new-stores.jpg',
      link: 'directory',
      isActive: true,
      priority: 2,
      startDate: now,
      endDate: oneMonthFromNow,
    },
  })

  await db.banner.create({
    data: {
      mallId: mall.id,
      title: 'Weekend Special Offers',
      titleAr: 'عروض نهاية الأسبوع الخاصة',
      image: '/banners/weekend-offers.jpg',
      link: 'deals',
      isActive: true,
      priority: 3,
      startDate: now,
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // ============ SAMPLE ORDERS ============
  console.log('📋 Creating sample orders...')

  // Get some product IDs for orders
  const allProducts = await db.product.findMany({
    where: { shopId: freshMarketShop.id },
    take: 6,
  })

  // Pending order
  const pendingOrder = await db.order.create({
    data: {
      customerId: customer.id,
      shopId: freshMarketShop.id,
      status: 'pending',
      total: allProducts[0].price * 2 + allProducts[1].price,
      notes: 'Please choose green bananas',
    },
  })
  await db.orderItem.createMany({
    data: [
      { orderId: pendingOrder.id, productId: allProducts[0].id, quantity: 2, price: allProducts[0].price },
      { orderId: pendingOrder.id, productId: allProducts[1].id, quantity: 1, price: allProducts[1].price },
    ],
  })

  // Preparing order
  const preparingOrder = await db.order.create({
    data: {
      customerId: customer.id,
      shopId: freshMarketShop.id,
      status: 'preparing',
      total: allProducts[2].price * 3 + allProducts[3].price * 2,
    },
  })
  await db.orderItem.createMany({
    data: [
      { orderId: preparingOrder.id, productId: allProducts[2].id, quantity: 3, price: allProducts[2].price },
      { orderId: preparingOrder.id, productId: allProducts[3].id, quantity: 2, price: allProducts[3].price },
    ],
  })

  // Ready for pickup order
  const readyOrder = await db.order.create({
    data: {
      customerId: customer.id,
      shopId: freshMarketShop.id,
      status: 'ready',
      total: allProducts[4].price + allProducts[5].price * 2,
    },
  })
  await db.orderItem.createMany({
    data: [
      { orderId: readyOrder.id, productId: allProducts[4].id, quantity: 1, price: allProducts[4].price },
      { orderId: readyOrder.id, productId: allProducts[5].id, quantity: 2, price: allProducts[5].price },
    ],
  })

  // ============ VISITOR STATS ============
  console.log('📊 Creating visitor stats...')

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]

  await db.visitorStat.createMany({
    data: [
      // Zara - popular shop
      { entityType: 'shop', entityId: zaraShop.id, views: 150, date: today },
      { entityType: 'shop', entityId: zaraShop.id, views: 200, date: yesterday },
      { entityType: 'shop', entityId: zaraShop.id, views: 180, date: dayBefore },
      // Fresh Market - popular
      { entityType: 'shop', entityId: freshMarketShop.id, views: 120, date: today },
      { entityType: 'shop', entityId: freshMarketShop.id, views: 95, date: yesterday },
      { entityType: 'shop', entityId: freshMarketShop.id, views: 110, date: dayBefore },
      // Apple Store
      { entityType: 'shop', entityId: appleShop.id, views: 100, date: today },
      { entityType: 'shop', entityId: appleShop.id, views: 130, date: yesterday },
      // VOX Cinema
      { entityType: 'shop', entityId: voxShop.id, views: 90, date: today },
      { entityType: 'shop', entityId: voxShop.id, views: 85, date: yesterday },
      // Nike
      { entityType: 'shop', entityId: nikeShop.id, views: 75, date: today },
      // Samsung
      { entityType: 'shop', entityId: samsungShop.id, views: 60, date: today },
      { entityType: 'shop', entityId: samsungShop.id, views: 70, date: yesterday },
      // Sephora
      { entityType: 'shop', entityId: sephoraShop.id, views: 55, date: today },
      // Category views
      { entityType: 'category', entityId: fashionCat.id, views: 300, date: today },
      { entityType: 'category', entityId: supermarketCat.id, views: 250, date: today },
      { entityType: 'category', entityId: electronicsCat.id, views: 200, date: today },
      // Deal views
      { entityType: 'deal', entityId: zaraShop.id, views: 500, date: today },
    ],
  })

  // ============ SUBSCRIPTIONS ============
  console.log('💎 Creating subscriptions...')

  await db.subscription.createMany({
    data: [
      { shopId: zaraShop.id, tier: 'premium', startDate: now, endDate: twoMonthsFromNow, isActive: true },
      { shopId: freshMarketShop.id, tier: 'premium', startDate: now, endDate: twoMonthsFromNow, isActive: true },
      { shopId: appleShop.id, tier: 'premium', startDate: now, endDate: twoMonthsFromNow, isActive: true },
      { shopId: sephoraShop.id, tier: 'premium', startDate: now, endDate: oneMonthFromNow, isActive: true },
      { shopId: voxShop.id, tier: 'premium', startDate: now, endDate: oneMonthFromNow, isActive: true },
      { shopId: carrefourShop.id, tier: 'premium', startDate: now, endDate: oneMonthFromNow, isActive: true },
    ],
  })

  console.log('✅ Seeding completed successfully!')

  // Print summary
  const shopCount = await db.shop.count()
  const productCount = await db.product.count()
  const dealCount = await db.deal.count()
  const userCount = await db.user.count()
  const orderCount = await db.order.count()
  const bannerCount = await db.banner.count()

  console.log('\n📊 Database Summary:')
  console.log(`   Users: ${userCount}`)
  console.log(`   Shops: ${shopCount}`)
  console.log(`   Products: ${productCount}`)
  console.log(`   Deals: ${dealCount}`)
  console.log(`   Orders: ${orderCount}`)
  console.log(`   Banners: ${bannerCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
