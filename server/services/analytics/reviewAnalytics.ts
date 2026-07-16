import Review from "server/models/Review";

interface GetReviewAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

const ratingValues = [1, 2, 3, 4, 5] as const;

export const getReviewAnalytics = async ({
  startDate,
  endDate,
}: GetReviewAnalyticsOptions) => {
  const result = await Review.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },

    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              totalReviews: {
                $sum: 1,
              },

              averageRating: {
                $avg: "$rating",
              },
            },
          },
        ],

        distribution: [
          {
            $group: {
              _id: "$rating",

              count: {
                $sum: 1,
              },
            },
          },
        ],
      },
    },
  ]);

  const summary = result[0]?.summary?.[0];

  const totalReviews = summary?.totalReviews ?? 0;

  const averageRating = Number((summary?.averageRating ?? 0).toFixed(2));

  const distributionResult = result[0]?.distribution ?? [];

  const ratingDistribution = ratingValues.map((rating) => {
    const matchingRating = distributionResult.find(
      (item: { _id: number; count: number }) => item._id === rating,
    );

    const count = matchingRating?.count ?? 0;

    const percentage =
      totalReviews > 0 ? Number(((count / totalReviews) * 100).toFixed(2)) : 0;

    return {
      rating,
      count,
      percentage,
    };
  });

  return {
    totalReviews,
    averageRating,
    ratingDistribution,
  };
};
