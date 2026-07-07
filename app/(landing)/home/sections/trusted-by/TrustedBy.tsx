import {
  TrustedByContainer,
  TrustedByImage,
  TrustedByImageContainer,
  TrustedByTitle,
} from "./styled";
import Logo1 from "@/assets/images/logo.svg";
import Logo2 from "@/assets/images/logo2.svg";
import Logo3 from "@/assets/images/logo3.svg";
import Logo4 from "@/assets/images/logo4.svg";
import Logo5 from "@/assets/images/logo5.svg";

export const TrustedBy = () => {
  return (
    <TrustedByContainer>
      <TrustedByTitle>TRUSTED BY 1000+ BUSINESSES WORLDWIDE</TrustedByTitle>
      <TrustedByImageContainer>
        <TrustedByImage
          src={Logo2}
          alt="Trusted By"
          width={200}
          height={200}
        />
        <TrustedByImage
          src={Logo3}
          alt="Trusted By"
          width={200}
          height={200}
        />
        <TrustedByImage
          src={Logo4}
          alt="Trusted By"
          width={200}
          height={200}
        />
        <TrustedByImage
          src={Logo5}
          alt="Trusted By"
          width={200}
          height={200}
        />
        <TrustedByImage
          src={Logo1}
          alt="Trusted By"
          width={200}
          height={200}
        />
      </TrustedByImageContainer>
    </TrustedByContainer>
  );
};
