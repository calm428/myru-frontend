import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();

  const locale = req.nextUrl.searchParams.get('language') || 'en';

  // Извлечение куки access_token
  const token = req.cookies.get('access_token')?.value; // Получаем только значение токена

  try {
    const res = await fetch(
      `${process.env.API_URL}/api/profiles/get${query ? `?${query}` : ''}`,
      {
        headers: {
          // Добавляем заголовок Authorization с токеном
          Authorization: `${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await res.json();
    console.log(data.data);
    const profiles = data.data.map((item: any) => {
      return {
        canFollow: item.canFollow,
        username: item.profile?.User?.Name || '',
        bio: item.profile?.MultilangDescr
          ? item.profile.MultilangDescr[
              locale.charAt(0).toUpperCase() + locale.slice(1)
            ] || ''
          : '',
        avatar:
          item.profile?.photos?.length > 0 &&
          item.profile.photos[0]?.files?.length > 0
            ? `https://proxy.myru.online/300/https://img.myru.online/${item.profile.photos[0].files[0].path}`
            : '',
        tags: item.profile?.Hashtags?.map((tag: any) => tag.Hashtag) || [],
        cities:
          item.profile?.City?.map((city: any) => city.Translations[0]?.Name) ||
          [],
        categories:
          item.profile?.Guilds?.map(
            (guild: any) => guild.Translations[0]?.Name
          ) || [],
        qrcode: item.profile?.User?.Name || '',
        countrycode: item.profile?.Lang || '',
        totalfollowers: item.profile?.User?.TotalFollowers || 0,
        review: {
          totaltime: item.profile?.User?.TotalOnlineHours?.[0] || {},
          monthtime: item.profile?.User?.OnlineHours?.[0] || {},
          totalposts: item.profile?.User?.TotalBlogs || 0,
        },
        streaming:
          item.profile?.streaming?.map((stream: any) => ({
            roomID: stream.RoomID,
            title: stream.Title,
            userID: stream.UserID,
            createdAt: stream.CreatedAt,
          })) || [],
      };
    });

    console.log(profiles);

    return NextResponse.json({ data: profiles, meta: data.meta });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
