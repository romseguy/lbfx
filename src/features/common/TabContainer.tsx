import { Flex, FlexProps, Heading, useColorMode } from "@chakra-ui/react";
import React from "react";

export const TabContainer = ({
  children,
  mb = 5,
  ...props
}: FlexProps & {
  children: React.ReactNode | React.ReactNodeArray;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      flexDirection="column"
      //bg={isDark ? "gray.700" : "cyan.100"}
      borderTopRadius="lg"
      mb={mb}
      {...props}
    >
      {children}
    </Flex>
  );
};

export const TabContainerHeader = ({
  children,
  heading,
  ...props
}: FlexProps & {
  children?: React.ReactNode | React.ReactNodeArray;
  heading?: string | React.ReactNode;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      alignItems="center"
      bg={isDark ? "#63B3ED" : "#2B6CB0"}
      color={isDark ? "black" : "white"}
      borderTopRadius="lg"
      cursor={heading ? "default" : "pointer"}
      py={3}
      tabIndex={0}
      _hover={{
        backgroundColor: isDark ? "blue.400" : "blue.400",
        color: isDark ? "white" : undefined
      }}
      {...props}
    >
      {heading ? (
        <Heading size="sm" pl={3}>
          {heading}
        </Heading>
      ) : (
        children
      )}
    </Flex>
  );
};

export const TabContainerContent = ({
  children,
  ...props
}: FlexProps & {
  children: React.ReactNode | React.ReactNodeArray;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      flexDirection="column"
      bgColor={isDark ? "gray.700" : "whiteAlpha.700"}
      {...props}
    >
      {children}
    </Flex>
  );
};
