// src/components/Card.tsx
import Link from 'next/link';
import {
  Card as BsCard,
  Button as BsButton,
  CardBody as BsCardBody,
  CardTitle as BsCardTitle,
  CardFooter as BsCardFooter
} from 'react-bootstrap';

interface CardProps {
  title: string;
}

export default function Card({ title }: CardProps) {
  let hrefPath: string;

  if (title === "Visitante") {
    hrefPath = "/visitante";
  } else if (title === "Socio") {
    hrefPath = "/login?role=socio";
  } else {
    hrefPath = "/";
  }

  return (
    <BsCard className="text-center shadow h-100 transform-on-hover">
      <BsCardBody className="d-flex flex-column justify-content-center align-items-center">
        <BsCardTitle as="h2" className="mb-0 text-primary fw-bold">
          {title}
        </BsCardTitle>
      </BsCardBody>
      <BsCardFooter className="bg-light p-0">
        <Link href={hrefPath} className="text-decoration-none w-100">
          <BsButton 
            variant="link" 
            className="text-decoration-none w-100 py-3 text-dark fw-bold"
          >
            {title === "Visitante" ? "Continuar" : "Acceder"}
          </BsButton>
        </Link>
      </BsCardFooter>
    </BsCard>
  );
}