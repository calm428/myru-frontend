export type Blog = {
  id: number;
  Title: string;
  Votes: any | null;
  MultilangTitle: {
    En: string;
    Ru: string;
    Ka: string;
    Es: string;
  };
  Descr: string;
  MultilangDescr: {
    En: string;
    Ru: string;
    Ka: string;
    Es: string;
  };
  Slug: string;
  Content: string;
  MultilangContent: {
    En: string;
    Ru: string;
    Ka: string;
    Es: string;
  };
  Status: string;
  Lang: string;
  Sticker: string;
  City: any | null;
  Catygory: any | null;
  UniqId: string;
  Days: number;
  Views: number;
  Total: number;
  TmId: number;
  photos: any | null;
  NotAds: boolean;
  User: any;
  UserAvatar: string;
  Pined: boolean;
  UserID: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  ExpiredAt: string;
  Hashtags: Array<{
    ID: number;
    Hashtag: string;
    UpdatedAt: string;
    DeletedAt: string | null;
  }> | null; // Обновленное поле Hashtags
};
