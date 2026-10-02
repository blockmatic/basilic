"use client";

import { type BaseComponentProps, useBoundProp } from "@json-render/react";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentTitle,
} from "@repo/ui/components/attachment";
import { Bubble, BubbleContent } from "@repo/ui/components/bubble";
import { Label } from "@repo/ui/components/label";
import { Marker, MarkerContent } from "@repo/ui/components/marker";
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@repo/ui/components/message";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { useState } from "react";

import type { CommandComponentProps } from "@/lib/genui/catalog/definitions";

export const conversationComponents = {
  Message: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Message">>) => (
    <Message align={props.align ?? "start"}>
      {props.author ? <MessageHeader>{props.author}</MessageHeader> : null}
      <MessageContent>
        <p>{props.body}</p>
        {children}
      </MessageContent>
    </Message>
  ),

  Bubble: ({ props }: BaseComponentProps<CommandComponentProps<"Bubble">>) => (
    <Bubble align={props.align ?? "start"} variant={props.variant ?? "default"}>
      <BubbleContent>{props.text}</BubbleContent>
    </Bubble>
  ),

  Attachment: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Attachment">>) => (
    <Attachment>
      <AttachmentContent>
        <AttachmentTitle>{props.name}</AttachmentTitle>
        {props.sizeLabel ? (
          <AttachmentDescription>{props.sizeLabel}</AttachmentDescription>
        ) : null}
        {props.url ? (
          <a
            className="text-primary text-sm underline"
            href={props.url}
            rel="noreferrer"
            target="_blank"
          >
            Open
          </a>
        ) : null}
      </AttachmentContent>
    </Attachment>
  ),

  Marker: ({ props }: BaseComponentProps<CommandComponentProps<"Marker">>) => (
    <Marker>
      <MarkerContent>{props.label}</MarkerContent>
    </Marker>
  ),

  Questionnaire: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Questionnaire">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const options = props.options ?? [];

    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">{props.question}</p>
        <RadioGroup
          onValueChange={(next) => {
            setValue(next);
            emit("change");
          }}
          value={value}
        >
          {options.map((option, index) => (
            <div className="flex items-center gap-2" key={option}>
              <RadioGroupItem
                id={`${props.question}-${index}`}
                value={option}
              />
              <Label
                className="cursor-pointer"
                htmlFor={`${props.question}-${index}`}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  },
};
