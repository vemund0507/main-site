import styled from "styled-components";

export const ReferralButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;

  button {
    margin-bottom: 20px;
    margin-right: 20px;
  }
`;

export const ReferralTextInput = styled.input`
  padding: 10px 10px 10px 10px;
  margin: 0;
  font-size: 16px;
  background-color: var(--primary);
  color: var(--secondary);
  border: 1px solid red;
  border-radius: 20px;
  width: 100%;

  &:hover {
    cursor: text;
  }
`;
