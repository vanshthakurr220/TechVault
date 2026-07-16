import { Product } from "server/models/Products";

interface GetInventoryAnalyticsOptions {
  lowStockThreshold?: number;
  limit?: number;
}

export const getInventoryAnalytics = async ({
  lowStockThreshold = 5,
  limit = 10,
}: GetInventoryAnalyticsOptions = {}) => {
  const [lowStockProducts, outOfStockProducts] = await Promise.all([
    Product.find({
      stockQuantity: {
        $gt: 0,
        $lte: lowStockThreshold,
      },
    })
      .select("_id name image images stockQuantity inStock")
      .sort({
        stockQuantity: 1,
      })
      .limit(limit)
      .lean(),

    Product.find({
      $or: [
        {
          stockQuantity: {
            $lte: 0,
          },
        },
        {
          inStock: false,
        },
      ],
    })
      .select("_id name image images stockQuantity inStock")
      .sort({
        stockQuantity: 1,
      })
      .limit(limit)
      .lean(),
  ]);

  const [lowStockCount, outOfStockCount] = await Promise.all([
    Product.countDocuments({
      stockQuantity: {
        $gt: 0,
        $lte: lowStockThreshold,
      },
    }),

    Product.countDocuments({
      $or: [
        {
          stockQuantity: {
            $lte: 0,
          },
        },
        {
          inStock: false,
        },
      ],
    }),
  ]);

  const formatProduct = (product: any) => ({
    productId: product._id.toString(),

    name: product.name,

    image: product.images?.[0] || product.image || "",

    stockQuantity: product.stockQuantity ?? 0,

    inStock: product.inStock ?? false,
  });

  return {
    lowStockCount,

    outOfStockCount,

    lowStockProducts: lowStockProducts.map(formatProduct),

    outOfStockProducts: outOfStockProducts.map(formatProduct),
  };
};
