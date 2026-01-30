import { Header } from "@/components";
import { HomeContainer, Title } from "./styled";

export default async function AdminHome() {
  return (
    <>
      <Header />
      <HomeContainer>
        <Title>Adentify</Title>
      </HomeContainer>
    </>
  );
}
