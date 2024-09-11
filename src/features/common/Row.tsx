import { Flex, FlexProps, useColorMode } from "@chakra-ui/react";
import React from "react";

export const Row = ({ children, ...props }: FlexProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <Flex
      alignItems="center"
      bg={isDark ? "black" : "white"}
      borderColor={isDark ? "white" : "black"}
      borderRadius="lg"
      borderStyle="solid"
      borderWidth={1}
      fontSize="lg"
      mt={1}
      p={1}
      {...props}
    >
      {children}
    </Flex>
  );
};
