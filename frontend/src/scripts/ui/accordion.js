const ANIMATION_DURATION_MS = 300;
const ANIMATION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const CLOSING_ATTRIBUTE = "data-closing";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const runningAnimations = new WeakMap();

function getHeight(item) {
  return item.getBoundingClientRect().height;
}

function isExpanded(item) {
  return item.open && !item.hasAttribute(CLOSING_ATTRIBUTE);
}

function stopAnimation(item) {
  runningAnimations.get(item)?.cancel();
  runningAnimations.delete(item);
}

function animateHeight(item, fromHeight, toHeight, onFinish) {
  if (reducedMotionQuery.matches) {
    onFinish?.();
    return;
  }

  const animation = item.animate(
    { height: [`${fromHeight}px`, `${toHeight}px`] },
    { duration: ANIMATION_DURATION_MS, easing: ANIMATION_EASING }
  );

  runningAnimations.set(item, animation);
  animation.addEventListener("finish", () => {
    runningAnimations.delete(item);
    onFinish?.();
  });
}

function expand(item) {
  const startHeight = getHeight(item);
  stopAnimation(item);

  item.removeAttribute(CLOSING_ATTRIBUTE);
  item.open = true;

  animateHeight(item, startHeight, getHeight(item));
}

function collapse(item) {
  const startHeight = getHeight(item);
  stopAnimation(item);

  item.setAttribute(CLOSING_ATTRIBUTE, "");
  item.open = false;
  const endHeight = getHeight(item);
  item.open = true;

  animateHeight(item, startHeight, endHeight, () => {
    item.open = false;
    item.removeAttribute(CLOSING_ATTRIBUTE);
  });
}


export function initAccordion(container) {
  const items = [...container.querySelectorAll("details")];

  items.forEach((item) => {
    item.querySelector("summary").addEventListener("click", (event) => {
      event.preventDefault();

      if (isExpanded(item)) {
        collapse(item);
        return;
      }

      items.filter((otherItem) => otherItem !== item && isExpanded(otherItem)).forEach(collapse);
      expand(item);
    });
  });
}
