import LogoutBtn from "./_components/logout-btn";
import ProfileLayouts from "./_components/profile-layouts";
import ProfilePagMenu from "./_components/profile-page-menu";

export default async function ProfilePage() {
     return (
          <ProfileLayouts>
               <ProfilePagMenu />
               <LogoutBtn />
          </ProfileLayouts>
     );
}
