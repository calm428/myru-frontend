export async function fetchProfileDetails(locale: string, username: string, userId: string | null) {
    try {
      const res = await fetch(`${process.env.API_URL}/api/profiles/get/${username}?language=${locale}`);
  
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await res.json();
  
      const profile = {
        id: data.data.ID,
      username: data.data.Name,
      bio:
        data.data.Profile?.length > 0
          ? data.data.Profile[0].MultilangDescr[
              locale.charAt(0).toUpperCase() + locale.slice(1)
            ]
          : '',
      hashtags:
        data.data.Profile?.length > 0
          ? data.data.Profile[0].Hashtags.map((tag: any) => tag.Hashtag)
          : [],
      cities:
        data.data.Profile?.length > 0
          ? data.data.Profile[0].City.map(
              (city: any) => city.Translations[0].Name
            )
          : [],
      categories:
        data.data.Profile?.length > 0
          ? data.data.Profile[0].Guilds.map(
              (guild: any) => guild.Translations[0].Name
            )
          : [],
      country: data.data.Profile?.length > 0 ? data.data.Profile[0].Lang : 'en',
      latestblog:
        data.data.highestIsUpBlog.ID > 0
          ? {
              title:
                data.data.highestIsUpBlog.MultilangTitle[
                  locale.charAt(0).toUpperCase() + locale.slice(1)
                ],
              subtitle:
                data.data.highestIsUpBlog.MultilangDescr[
                  locale.charAt(0).toUpperCase() + locale.slice(1)
                ],
              hero:
                data.data.highestIsUpBlog.photos?.length > 0 &&
                data.data.highestIsUpBlog.photos[0].files?.length > 0
                  ? `https://proxy.myru.online/400/https://img.myru.online/${data.data.highestIsUpBlog.photos[0].files[0].path}`
                  : '',
              review: {
                votes: data.data.totalVotes,
                views: data.data.highestIsUpBlog.Views,
              },
              link: `${data.data.highestIsUpBlog.UniqId}/${data.data.highestIsUpBlog.Slug}`,
            }
          : null,
      review: {
        totaltime: data.data.TotalOnlineHours[0],
        monthtime: data.data.OnlineHours[0],
        totalposts: data.data.TotalRestBlogs,
        monthposts: data.data.TotalBlogs,
        followers: data.data.Followings.length,
      },
      session: data.data.Session,
      gallery:
        data.data.Profile[0].photos?.length > 0
          ? data.data.Profile[0].photos[0].files?.map((file: any) => {
              return {
                original: `https://proxy.myru.online/400/https://img.myru.online/${file.path}`,
                thumbnail: `https://proxy.myru.online/50/https://img.myru.online/${file.path}`,
              };
            })
          : [],
      description:
        data.data.Profile[0].MultilangDescr[
          locale.charAt(0).toUpperCase() + locale.slice(1)
        ],
      additionalinfo:
        data.data.Profile[0].MultilangAdditional[
          locale.charAt(0).toUpperCase() + locale.slice(1)
        ],
      telegram: data.data.TelegramActivated ? data.data.TelegramName : '',
      qrcode: data.data.Name,
      follow: userId
        ? data.data.Followings.filter((item: any) => item.ID === userId)?.length > 0
        : false,
      me: userId === data.data.ID,
      bot: data.data.IsBot,
      streaming: data?.data?.Profile?.[0]?.streaming?.length > 0
        ? data.data.Profile[0].streaming.map((stream: any) => ({
            roomID: stream.RoomID,
            title: stream.Title,
            userID: stream.UserID,
            createdAt: stream.CreatedAt,
          }))
        : [],
      };
  
      return profile;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  