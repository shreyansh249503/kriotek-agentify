import React from "react";
import {
  MakeItYoursCardContainer,
  MakeItYoursCardImage,
  MakeItYoursCardText,
  MakeItYoursContainer,
  MakeItYoursHR,
  MakeItYoursMainContainer,
  MakeItYoursSectionHeader,
  MakeItYoursTitleBtn,
  MakesItYoursHeading,
} from "./styled";
import CardImg1 from "@/assets/images/make-it-yours-img1.svg";
import CardImg2 from "@/assets/images/make-it-yours-img2.svg";
import CardImg3 from "@/assets/images/make-it-yours-img3.svg";
import CardImg4 from "@/assets/images/make-it-yours-img4.svg";
import CardImg5 from "@/assets/images/make-it-yours-img5.svg";
import { GoDotFill } from "react-icons/go";

const MAKE_IT_YOURS_ITEMS = [
  { id: 1, image: CardImg1, label: "Name your Bot" },
  { id: 2, image: CardImg2, label: "Choose Theme Color" },
  { id: 3, image: CardImg3, label: "Set Bot Persona" },
  { id: 4, image: CardImg4, label: "Choose Avatar" },
  { id: 5, image: CardImg5, label: "Select Category" },
];

export const MakeItYours = () => {
  return (
    <MakeItYoursMainContainer>
      <MakeItYoursSectionHeader>
        <MakeItYoursTitleBtn>Make it Yours</MakeItYoursTitleBtn>
        <MakesItYoursHeading>
          Fully Customizable. Matches your Brand Perfectly.
        </MakesItYoursHeading>
      </MakeItYoursSectionHeader>
      <MakeItYoursContainer>
        {MAKE_IT_YOURS_ITEMS.map((item, index) => (
          <React.Fragment key={item.id}>
            <MakeItYoursCardContainer>
              <MakeItYoursCardImage
                src={item.image}
                width={240}
                height={160}
                alt={item.label}
              />
              <MakeItYoursCardText>
                <GoDotFill />
                {item.label}
              </MakeItYoursCardText>
            </MakeItYoursCardContainer>
            {index < MAKE_IT_YOURS_ITEMS.length - 1 && <MakeItYoursHR />}
          </React.Fragment>
        ))}
      </MakeItYoursContainer>
    </MakeItYoursMainContainer>
  );
};
