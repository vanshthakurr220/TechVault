import ProductQuestion from "../../models/ProductQuestion";

interface GetQuestionAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

const getStartOfToday = (): Date => {
  const now = new Date();

  const indiaTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  );

  indiaTime.setHours(0, 0, 0, 0);

  return indiaTime;
};

const getEndOfToday = (): Date => {
  const now = new Date();

  const indiaTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  );

  indiaTime.setHours(23, 59, 59, 999);

  return indiaTime;
};

export const getQuestionAnalytics = async ({
  startDate,
  endDate,
}: GetQuestionAnalyticsOptions) => {
  const todayStart = getStartOfToday();
  const todayEnd = getEndOfToday();

  const [periodResult, answeredToday] = await Promise.all([
    ProductQuestion.aggregate([
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

                totalQuestions: {
                  $sum: 1,
                },

                pendingQuestions: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "pending"],
                      },
                      1,
                      0,
                    ],
                  },
                },

                answeredQuestions: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "answered"],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          responseTimes: [
            {
              $match: {
                status: "answered",

                answeredAt: {
                  $ne: null,
                },
              },
            },

            {
              $project: {
                responseTimeMilliseconds: {
                  $subtract: ["$answeredAt", "$createdAt"],
                },
              },
            },

            {
              $group: {
                _id: null,

                averageResponseTimeMilliseconds: {
                  $avg: "$responseTimeMilliseconds",
                },
              },
            },
          ],
        },
      },
    ]),

    ProductQuestion.countDocuments({
      status: "answered",

      answeredAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }),
  ]);

  const summary = periodResult[0]?.summary?.[0];

  const responseTime =
    periodResult[0]?.responseTimes?.[0]?.averageResponseTimeMilliseconds ?? 0;

  const averageResponseTimeHours = Number(
    (responseTime / (1000 * 60 * 60)).toFixed(2),
  );

  return {
    totalQuestions: summary?.totalQuestions ?? 0,
    pendingQuestions: summary?.pendingQuestions ?? 0,
    answeredQuestions: summary?.answeredQuestions ?? 0,
    answeredToday,
    averageResponseTimeHours,
  };
};
